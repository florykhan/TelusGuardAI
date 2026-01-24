import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import towersData from "../data/telus_towers.json";
import CoverageMap from "../components/CoverageMap.jsx";

export default function CoverageMapPage() {
  // Filters
  const [radio, setRadio] = useState("ALL");

  // Live-ish KPI state (mock now, backend later)
  const [kpiById, setKpiById] = useState({});

  // UI state
  const [layers, setLayers] = useState({ towers: true, heatmap: true, zones: true });
  const [selectedTower, setSelectedTower] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  // Pick a demo center (change later to Toronto / Vancouver)
  // Canada-ish center:
  const center = [56.1304, -106.3468];

  const radios = useMemo(() => {
    const set = new Set(towersData.map((t) => t.radio));
    return ["ALL", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    if (radio === "ALL") return towersData;
    return towersData.filter((t) => t.radio === radio);
  }, [radio]);

  // Performance cap
  const MAX_RENDER = 5000;
  const toRender = filtered.slice(0, MAX_RENDER);

  // Mock agent/model response (replace later with backend output). Shape matches: events[].affected_areas[] with lat_range/long_range.
   
  const mockAgentResponse = {
    events: [
      // ===== Event 1: BC Place (concert) =====
      {
        event_id: "event_bc_place",
        event_name: "Concert at BC Place",
        affected_areas: [
          {
            area_name: "BC Place / Stadium District",
            center: { latitude: 49.2767, longitude: -123.1119 },
            lat_range: [49.2725, 49.2810],
            long_range: [-123.1180, -123.1050],
            severity: "critical",
            confidence: 0.82,
            estimated_impact: "~12,000 users",
            reasoning:
              "High event intensity near the stadium combined with elevated baseline traffic on nearby towers.",
            affected_towers: ["T_102", "T_087", "T_144"],
            mitigation_actions: [
              "load-balance to adjacent towers",
              "reserve simulated capacity for peak window",
            ],
          },
        ],
      },
  
      // ===== Event 2: Toronto Ice Storm =====
      {
        event_id: "evt_ice_storm_toronto",
        event_name: "Ice Storm – Toronto",
        affected_areas: [
          {
            area_name: "Downtown Toronto Core",
            severity: "critical",
            lat_range: [43.640, 43.680],
            long_range: [-79.400, -79.360],
            center: { lat: 43.660, lon: -79.380 },
            confidence: 0.94,
            estimated_impact: "~15,000 users",
            reasoning:
              "Severe weather impact combined with power instability caused multiple towers to operate near failure thresholds.",
          },
          {
            area_name: "Scarborough East",
            severity: "moderate",
            lat_range: [43.750, 43.790],
            long_range: [-79.220, -79.180],
            center: { lat: 43.770, lon: -79.200 },
            confidence: 0.76,
            estimated_impact: "~5,000 users",
            reasoning:
              "Secondary impact from grid instability and reduced backhaul capacity during peak load.",
          },
        ],
      },
    ],
  };
  

  // Simulated live KPIs. Updates every 1s.
   
  useEffect(() => {
    const interval = setInterval(() => {
      setKpiById((prev) => {
        const next = { ...prev };
        for (const t of toRender) {
          next[t.id] = {
            traffic: Math.random(),
            latency: 20 + Math.random() * 80,
            loss: Math.random() * 0.05,
            energy: Math.random(),
            updatedAt: new Date().toISOString(),
          };
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [toRender]);

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>TELUS Towers – Live KPIs + Impact Areas</h1>
          <p style={{ marginTop: 6, opacity: 0.75 }}>
            Showing {toRender.length} / {filtered.length} towers
          </p>
        </div>
        <Link to="/">Back</Link>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", margin: "12px 0" }}>
        <label>
          Radio:
          <select value={radio} onChange={(e) => setRadio(e.target.value)} style={{ marginLeft: 8 }}>
            {radios.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        {/* Layer toggles */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={layers.towers}
              onChange={(e) => setLayers((p) => ({ ...p, towers: e.target.checked }))}
            />
            Towers
          </label>

          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={layers.heatmap}
              onChange={(e) => setLayers((p) => ({ ...p, heatmap: e.target.checked }))}
            />
            Heatmap
          </label>

          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={layers.zones}
              onChange={(e) => setLayers((p) => ({ ...p, zones: e.target.checked }))}
            />
            Impact Areas
          </label>
        </div>

        {/* Selection info */}
        {selectedTower && (
          <div style={{ opacity: 0.85 }}>
            Selected tower: <b>{selectedTower}</b>
          </div>
        )}
        {selectedArea && (
          <div style={{ opacity: 0.85 }}>
            Selected area: <b>{selectedArea}</b>
          </div>
        )}

        <div style={{ opacity: 0.75 }}>
          Note: KPIs are simulated right now (random). Backend will replace them.
        </div>
      </div>

      {/* Map */}
      <CoverageMap
        towers={toRender}
        center={center}
        zoom={4}
        kpiById={kpiById}
        agentResponse={mockAgentResponse}
        layers={layers}
        onSelectTower={(id) => {
          setSelectedTower(id);
          setSelectedArea(null);
        }}
        onSelectArea={(areaId) => {
          setSelectedArea(areaId);
          setSelectedTower(null);
        }}
      />
    </div>
  );
}
