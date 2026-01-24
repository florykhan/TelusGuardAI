import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle, useMap } from "react-leaflet";
import "leaflet.heat";
import L from "leaflet";

// Tower traffic -> color
function colorFromTraffic(traffic) {
  if (traffic == null) return "#3388ff";
  if (traffic > 0.8) return "#e53935";
  if (traffic > 0.5) return "#fb8c00";
  return "#43a047";
}

// severity label -> numeric 0..1
function severityToScore(sev) {
  const s = (sev || "").toLowerCase();
  if (s === "critical") return 0.95;
  if (s === "high") return 0.8;
  if (s === "moderate") return 0.6;
  if (s === "low") return 0.35;
  const n = Number(sev);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5;
}

// severity label -> outline color
function colorFromSeverityLabel(sev) {
  const s = severityToScore(sev);
  if (s > 0.85) return "#d32f2f";
  if (s > 0.65) return "#f57c00";
  return "#388e3c";
}

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, bounds]);
  return null;
}

// Heat layer wrapper (Leaflet.heat). Expects points: [{lat, lon, intensity}] intensity 0..1
function HeatLayer({ points, enabled }) {
  const map = useMap();

  const heatData = useMemo(() => {
    if (!enabled) return [];
    return (points || []).map((p) => [
      p.lat,
      p.lon,
      Math.max(0, Math.min(1, p.intensity ?? p.severity ?? 0.5)),
    ]);
  }, [points, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const layer = L.heatLayer(heatData, {
      radius: 25,
      blur: 18,
      maxZoom: 12,
    });

    layer.addTo(map);
    return () => map.removeLayer(layer);
  }, [map, enabled, heatData]);

  return null;
}

// Impact Areas overlay menu component
function ImpactAreasMenu({ impactAreas, selectedAreaId, onSelectImpactArea, isOpen, onToggle }) {
  const hasAreas = impactAreas && impactAreas.length > 0;

  return (
    <div
      data-impact-areas-menu
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(0,0,0,0.6)",
          color: "#e9ecf1",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        Impact Areas
      </button>

      {/* Menu panel */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 8,
            width: 320,
            maxHeight: "60vh",
            overflowY: "auto",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
            padding: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontWeight: 750, marginBottom: 8, fontSize: 16 }}>Impact Areas</div>

          {hasAreas ? (
            <>
              {/* Legend */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.9, marginBottom: 10 }}>
                <span>🟢 low</span>
                <span>🟠 medium</span>
                <span>🔴 critical</span>
              </div>

              {impactAreas.map((a) => {
            const isSelected = a.id === selectedAreaId;
            const dot = a.severity === "critical" ? "🔴" : a.severity === "high" ? "🟠" : "🟢";
            const confPct =
              a.confidence != null
                ? typeof a.confidence === "number"
                  ? `${Math.round(a.confidence * 100)}%`
                  : String(a.confidence)
                : "—";
            const towersTxt = a.affectedCount != null ? String(a.affectedCount) : "—";

            return (
              <button
                key={a.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectImpactArea(a);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: isSelected ? "rgba(255,255,255,0.08)" : "transparent",
                  padding: 10,
                  borderRadius: 10,
                  marginBottom: 10,
                  cursor: "pointer",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 650 }}>
                    {dot} {a.name}
                  </div>
                  <div style={{ opacity: 0.75 }}>{a.severity}</div>
                </div>

                <div style={{ opacity: 0.7, marginTop: 4, fontSize: 12 }}>{a.eventName}</div>

                <div style={{ display: "flex", gap: 12, marginTop: 6, opacity: 0.9 }}>
                  <div>
                    Affected towers: <b>{towersTxt}</b>
                  </div>
                  <div>
                    Confidence: <b>{confPct}</b>
                  </div>
                </div>
              </button>
            );
          })}
            </>
          ) : (
            <div style={{ opacity: 0.7 }}>No impact areas yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

// render agent/model response: response.events[].affected_areas[] with lat_range + long_range
export default function CoverageMap({
  towers,
  center,
  zoom = 5,
  kpiById = {},

  // agent response (raw)
  agentResponse = null,

  // toggles
  layers = { towers: true, heatmap: true, zones: true },

  // selection callbacks
  onSelectTower,
  onSelectArea,

  // NEW for UX polish
  selectedAreaId = null,
  focusBounds = null,

  // NEW: impact areas list and selection handler
  impactAreas = [],
  onSelectImpactArea,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e) => {
      // Check if click is outside the menu
      const menuElement = e.target.closest('[data-impact-areas-menu]');
      if (!menuElement) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Flatten affected areas from agent response
  const affectedAreas = useMemo(() => {
    const events = agentResponse?.events || [];
    const areas = [];

    for (const ev of events) {
      const evId = ev.event_id ?? ev.event_name ?? "event";
      const list = ev.affected_areas || [];

      for (const a of list) {
        const id = `${evId}::${a.area_name ?? a.area ?? "area"}`;
        const latRange = a.lat_range;
        const lonRange = a.long_range;

        if (!Array.isArray(latRange) || latRange.length !== 2) continue;
        if (!Array.isArray(lonRange) || lonRange.length !== 2) continue;

        const minLat = Math.min(latRange[0], latRange[1]);
        const maxLat = Math.max(latRange[0], latRange[1]);
        const minLon = Math.min(lonRange[0], lonRange[1]);
        const maxLon = Math.max(lonRange[0], lonRange[1]);

        areas.push({
          id,
          event_id: evId,
          name: a.area_name ?? a.area ?? id,
          severityLabel: a.severity ?? a.severity_level ?? "moderate",
          severityScore: severityToScore(a.severity ?? a.severity_level),
          center:
            a.center || {
              latitude: (minLat + maxLat) / 2,
              longitude: (minLon + maxLon) / 2,
            },
          bounds: [
            [minLat, minLon],
            [maxLat, maxLon],
          ],
          confidence: a.confidence,
          reasoning: a.reasoning,
          estimated_impact: a.estimated_impact,
          affected_towers: a.affected_towers,
          mitigation: a.mitigation_actions || a.mitigation,
        });
      }
    }

    areas.sort((x, y) => y.severityScore - x.severityScore);
    return areas;
  }, [agentResponse]);

  // Heatmap points from affected area centers
  const heatPoints = useMemo(() => {
    if (!layers.heatmap) return [];
    return affectedAreas
      .map((a) => {
        const lat = a.center?.latitude ?? a.center?.lat;
        const lon = a.center?.longitude ?? a.center?.lon ?? a.center?.long; // supports backend "long"
        if (lat == null || lon == null) return null;
        return { lat, lon, intensity: a.severityScore };
      })
      .filter(Boolean);
  }, [affectedAreas, layers.heatmap]);

  return (
    <div style={{ height: "80vh", width: "100%", position: "relative" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* NEW: auto-zoom to selected area */}
        <FitBounds bounds={focusBounds} />

        {/* Heatmap */}
        <HeatLayer points={heatPoints} enabled={!!layers.heatmap} />

        {/* Rectangles for affected areas */}
        {layers.zones &&
          affectedAreas.map((a) => {
            const isSelected = selectedAreaId === a.id;

            return (
              <Rectangle
                key={a.id}
                bounds={a.bounds}
                pathOptions={{
                  color: colorFromSeverityLabel(a.severityLabel),
                  weight: isSelected ? 5 : 2,
                  fillOpacity: isSelected ? 0.22 : 0.12,
                }}
                eventHandlers={{
                  click: () => onSelectArea?.(a.id),
                }}
              >
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <div>
                      <b>Area:</b> {a.name}
                    </div>
                    <div>
                      <b>Severity:</b> {String(a.severityLabel)} ({Math.round(a.severityScore * 100)}%)
                    </div>

                    {a.confidence != null && (
                      <div>
                        <b>Confidence:</b>{" "}
                        {typeof a.confidence === "number" ? `${Math.round(a.confidence * 100)}%` : String(a.confidence)}
                      </div>
                    )}

                    {a.estimated_impact && (
                      <div>
                        <b>Impact:</b> {a.estimated_impact}
                      </div>
                    )}

                    {Array.isArray(a.affected_towers) && (
                      <div>
                        <b>Affected towers:</b> {a.affected_towers.length}
                      </div>
                    )}

                    {a.reasoning && (
                      <>
                        <hr />
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          <b>Why:</b> {a.reasoning}
                        </div>
                      </>
                    )}

                    {a.mitigation && (
                      <>
                        <hr />
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          <b>Mitigation:</b> {JSON.stringify(a.mitigation)}
                        </div>
                      </>
                    )}
                  </div>
                </Popup>
              </Rectangle>
            );
          })}

        {/* Towers */}
        {layers.towers &&
          towers.map((t) => {
            const kpi = kpiById[t.id];

            return (
              <CircleMarker
                key={t.id}
                center={[t.lat, t.lon]}
                radius={4}
                pathOptions={{
                  color: colorFromTraffic(kpi?.traffic),
                  fillOpacity: 0.85,
                }}
                eventHandlers={{
                  click: () => onSelectTower?.(t.id),
                }}
              >
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <div>
                      <b>ID:</b> {t.id}
                    </div>
                    <div>
                      <b>Radio:</b> {t.radio}
                    </div>

                    {kpi && (
                      <>
                        <hr />
                        <div>
                          <b>Traffic:</b> {(kpi.traffic * 100).toFixed(0)}%
                        </div>
                        <div>
                          <b>Latency:</b> {kpi.latency.toFixed(1)} ms
                        </div>
                        <div>
                          <b>Packet Loss:</b> {(kpi.loss * 100).toFixed(2)}%
                        </div>
                        <div style={{ opacity: 0.6, marginTop: 4 }}>
                          updated {new Date(kpi.updatedAt).toLocaleTimeString()}
                        </div>
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>

      {/* Impact Areas overlay menu */}
      <ImpactAreasMenu
        impactAreas={impactAreas}
        selectedAreaId={selectedAreaId}
        onSelectImpactArea={onSelectImpactArea}
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
    </div>
  );
}
