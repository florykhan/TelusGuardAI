import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import L from "leaflet";
import EventPanel from "../components/EventPanel";
import CoverageMap from "../components/CoverageMap";
import DetailsPanel from "../components/DetailsPanel";
import ImpactAreaReport from "../components/ImpactAreaReport";
import EmptySelectionPanel from "../components/EmptySelectionPanel";
import SafetyPanel from "../components/SafetyPanel";
import towersData from "../data/telus_towers.json";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";
const KPIS_PATH = "/api/kpis";
const MAX_RENDER = 5000;
const center = [56.1304, -106.3468];

function countTowersInArea(area, towers) {
  if (!towers?.length || !area.bounds?.[0] || !area.bounds?.[1]) return 0;
  const [sw, ne] = area.bounds;
  const bounds = L.latLngBounds(sw, ne);
  return towers.filter((t) => t.lat != null && t.lon != null && bounds.contains(L.latLng(t.lat, t.lon))).length;
}

function severityToScore(sev) {
  const s = (sev || "").toLowerCase();
  if (s === "critical") return 0.95;
  if (s === "high") return 0.8;
  if (s === "moderate") return 0.6;
  if (s === "low") return 0.35;
  return 0.5;
}

const MOCK_AGENT_RESPONSE = {
  events: [
    {
      event_id: "event_bc_place",
      event_name: "Concert at BC Place",
      affected_areas: [
        {
          area_name: "BC Place / Stadium District",
          center: { latitude: 49.2767, longitude: -123.1119 },
          lat_range: [49.2725, 49.281],
          long_range: [-123.118, -123.105],
          severity: "critical",
          confidence: 0.82,
          estimated_impact: "~12,000 users",
          reasoning: "High event intensity near the stadium combined with elevated baseline traffic on nearby towers.",
          affected_towers: ["T_102", "T_087", "T_144"],
          mitigation_actions: ["load-balance to adjacent towers", "reserve simulated capacity for peak window"],
        },
      ],
    },
    {
      event_id: "evt_ice_storm_toronto",
      event_name: "Ice Storm – Toronto",
      affected_areas: [
        {
          area_name: "Downtown Toronto Core",
          severity: "critical",
          lat_range: [43.64, 43.68],
          long_range: [-79.4, -79.36],
          center: { lat: 43.66, lon: -79.38 },
          confidence: 0.94,
          estimated_impact: "~15,000 users",
          reasoning:
            "Severe weather impact combined with power instability caused multiple towers to operate near failure thresholds.",
          affected_towers: ["T_A", "T_B", "T_C"],
        },
        {
          area_name: "Scarborough East",
          severity: "moderate",
          lat_range: [43.75, 43.79],
          long_range: [-79.22, -79.18],
          center: { lat: 43.77, lon: -79.2 },
          confidence: 0.76,
          estimated_impact: "~5,000 users",
          reasoning: "Secondary impact from grid instability and reduced backhaul capacity during peak load.",
          affected_towers: ["T_1", "T_2", "T_3"],
        },
      ],
    },
  ],
};

export default function DashboardPage({
  selectedTower,
  setSelectedTower,
  aiActions,
  onAnalyze,
  loading,
  error,
  affectedAreas,
  agentResponse,
}) {
  const [radio, setRadio] = useState("ALL");
  const [layers, setLayers] = useState({ towers: true, heatmap: true, zones: true });
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [focusBounds, setFocusBounds] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [kpiByTowerId, setKpiByTowerId] = useState({});
  const fetchInProgressRef = useRef(false);
  const throttleRef = useRef({ lastRun: 0 });

  const activeResponse = agentResponse ?? MOCK_AGENT_RESPONSE;

  const radios = useMemo(() => {
    if (!towersData?.length) return ["ALL"];
    const uniq = [...new Set(towersData.map((t) => t.radio).filter(Boolean))];
    return ["ALL", ...uniq.sort()];
  }, []);

  const filtered = useMemo(() => {
    if (!towersData?.length) return [];
    if (radio === "ALL") return towersData;
    return towersData.filter((t) => t.radio === radio);
  }, [radio]);

  const toRender = filtered.slice(0, MAX_RENDER);

  const impactAreas = useMemo(() => {
    const events = activeResponse?.events ?? [];
    const out = [];
    for (const ev of events) {
      const evId = ev.event_id ?? ev.event_name ?? "event";
      for (const a of ev.affected_areas ?? []) {
        if (!Array.isArray(a.lat_range) || a.lat_range.length !== 2) continue;
        if (!Array.isArray(a.long_range) || a.long_range.length !== 2) continue;
        const minLat = Math.min(a.lat_range[0], a.lat_range[1]);
        const maxLat = Math.max(a.lat_range[0], a.lat_range[1]);
        const minLon = Math.min(a.long_range[0], a.long_range[1]);
        const maxLon = Math.max(a.long_range[0], a.long_range[1]);
        const id = `${evId}::${a.area_name ?? a.area ?? "area"}`;
        const severity = (a.severity ?? a.severity_level ?? "moderate").toLowerCase();
        out.push({
          id,
          name: a.area_name ?? a.area ?? id,
          eventName: ev.event_name ?? evId,
          severity,
          severityScore: severityToScore(severity),
          confidence: a.confidence,
          affectedCount: Array.isArray(a.affected_towers) ? a.affected_towers.length : null,
          reasoning: a.reasoning,
          estimated_impact: a.estimated_impact,
          mitigation: a.mitigation_actions || a.mitigation,
          bounds: [
            [minLat, minLon],
            [maxLat, maxLon],
          ],
        });
      }
    }
    out.sort((x, y) => y.severityScore - x.severityScore);
    return out;
  }, [activeResponse]);

  const impactAreasWithCounts = useMemo(() => {
    // Use filtered towers (toRender) to match what's displayed on the map
    if (!toRender?.length) return impactAreas.map((a) => ({ ...a, towerCount: 0 }));
    return impactAreas.map((a) => ({ ...a, towerCount: countTowersInArea(a, toRender) }));
  }, [impactAreas, toRender]);

  useEffect(() => {
    if (agentResponse) {
      setSelectedAreaId(null);
      setSelectedTower(null);
      setFocusBounds(null);
    }
  }, [agentResponse, setSelectedTower]);

  const getTowerId = useCallback((t) => t.id ?? `tower_${Math.round(t.lat * 1e6)}_${Math.round(t.lon * 1e6)}`, []);

  const selectImpactArea = useCallback(
    (area) => {
      setSelectedAreaId(area.id);
      setFocusBounds(area.bounds);
      setSelectedTower(null);
    },
    [setSelectedTower]
  );

  const fetchKPIs = useCallback(async (towerIds) => {
    if (!towerIds?.length || fetchInProgressRef.current) return;
    const capped = towerIds.slice(0, 1000);
    fetchInProgressRef.current = true;
    try {
      const res = await fetch(`${API_BASE}${KPIS_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tower_ids: capped, options: { mode: "sim", tick_ms: 1000 } }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.kpis) {
        setKpiByTowerId((prev) => ({ ...prev, ...data.kpis }));
      }
    } catch (e) {
      console.error("KPI fetch error:", e);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, []);

  const throttledFetchKPIs = useCallback((ids) => {
    const now = Date.now();
    if (now - throttleRef.current.lastRun >= 1500) {
      throttleRef.current.lastRun = now;
      fetchKPIs(ids);
    }
  }, [fetchKPIs]);

  useEffect(() => {
    if (!mapBounds) return;
    const visible = toRender.filter(
      (t) =>
        t.lat >= mapBounds.south &&
        t.lat <= mapBounds.north &&
        t.lon >= mapBounds.west &&
        t.lon <= mapBounds.east
    );
    const ids = visible.map(getTowerId);
    if (ids.length) throttledFetchKPIs(ids);
  }, [mapBounds, toRender, getTowerId, throttledFetchKPIs]);

  // Poll KPIs for the selected tower every 5 seconds
  useEffect(() => {
    if (!selectedTower) return;

    const towerId = getTowerId(selectedTower);
    if (!towerId) return;

    // Fetch immediately when tower is selected
    fetchKPIs([towerId]);

    // Set up polling interval (5 seconds)
    const intervalId = setInterval(() => {
      fetchKPIs([towerId]);
    }, 5000);

    // Cleanup: clear interval when tower changes, is deselected, or component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedTower, getTowerId, fetchKPIs]);

  const handleSelectTower = useCallback(
    (towerId) => {
      const tower = toRender.find((t) => getTowerId(t) === towerId);
      if (!tower) {
        setSelectedTower(null);
        return;
      }
      // Store only tower data, NOT KPI snapshot
      // KPI will be looked up fresh from kpiByTowerId when rendering
      // This ensures both popup and panel always use the latest KPI data
      // Polling effect will automatically start fetching KPIs for this tower
      setSelectedTower({ ...tower });
      setSelectedAreaId(null);
      setFocusBounds(null);
    },
    [toRender, getTowerId, setSelectedTower]
  );

  const handleSelectArea = useCallback(
    (areaId) => {
      const area = impactAreasWithCounts.find((a) => a.id === areaId);
      if (area) selectImpactArea(area);
      else setSelectedAreaId(areaId);
    },
    [impactAreasWithCounts, selectImpactArea]
  );

  return (
    <div className="noc-shell">
      <div className="noc-grid">
        {/* LEFT COLUMN */}
        <div className="noc-col noc-left">
          <div className="noc-col-inner">
            <div className="noc-section">
              <div className="noc-title">Event Analysis</div>
              <EventPanel onAnalyze={onAnalyze} loading={loading} />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="noc-col noc-center">
          <div className="noc-col-inner">
            <div
              className="noc-section"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div className="noc-title" style={{ margin: 0, flex: 1 }}>
                Network Coverage Map
              </div>

              {/* Map controls: Radio + layer toggles */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="noc-muted" style={{ fontSize: 12 }}>Signal:</span>
                  <select
                    value={radio}
                    onChange={(e) => setRadio(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.06)",
                      color: "inherit",
                      fontSize: 13,
                    }}
                  >
                    {radios.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={layers.towers}
                    onChange={(e) => setLayers((p) => ({ ...p, towers: e.target.checked }))}
                  />
                  Towers
                </label>
                <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={layers.heatmap}
                    onChange={(e) => setLayers((p) => ({ ...p, heatmap: e.target.checked }))}
                  />
                  Heatmap
                </label>
                <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={layers.zones}
                    onChange={(e) => setLayers((p) => ({ ...p, zones: e.target.checked }))}
                  />
                  Impact areas
                </label>
              </div>
            </div>

            <div style={{ padding: 12, height: "100%" }}>
              <div
                style={{
                  height: "calc(100vh - 96px)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <CoverageMap
                  towers={toRender}
                  center={center}
                  zoom={4}
                  kpiByTowerId={kpiByTowerId}
                  getTowerId={getTowerId}
                  agentResponse={activeResponse}
                  layers={layers}
                  selectedAreaId={selectedAreaId}
                  focusBounds={focusBounds}
                  impactAreas={impactAreasWithCounts}
                  onSelectImpactArea={selectImpactArea}
                  onMapBoundsChange={setMapBounds}
                  onSelectTower={handleSelectTower}
                  onSelectArea={handleSelectArea}
                  hideControls={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="noc-col noc-right">
          <div className="noc-col-inner">
            <div className="noc-section">
              {selectedTower ? (
                <>
                  <DetailsPanel 
                    tower={selectedTower} kpiByTowerId={kpiByTowerId} getTowerId={getTowerId}
                  />
                  <SafetyPanel
                    towerId={getTowerId(selectedTower)}
                  />
                </>
              ) : selectedAreaId ? (
                (() => {
                  const selectedArea = impactAreasWithCounts.find((a) => a.id === selectedAreaId);
                  return selectedArea ? (
                    <ImpactAreaReport area={selectedArea} />
                  ) : (
                    <EmptySelectionPanel />
                  );
                })()
              ) : (
                <EmptySelectionPanel />
              )}

              {error && (
                <div style={{ color: "#f87171", marginTop: 10 }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
