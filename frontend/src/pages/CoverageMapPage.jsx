import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMapEvents,
} from "react-leaflet";

function clamp01(x) {
  return Math.max(0, Math.min(1, x ?? 0));
}

function colorFromTraffic(traffic) {
  if (traffic == null) return "#3388ff";
  if (traffic > 0.85) return "#ef4444";
  if (traffic > 0.6) return "#f59e0b";
  return "#22c55e";
}

function statusFromTraffic(traffic01) {
  const t = clamp01(traffic01);
  if (t > 0.85) return { label: "critical", color: "#ef4444" };
  if (t > 0.6) return { label: "warning", color: "#f59e0b" };
  return { label: "online", color: "#22c55e" };
}

function zoneStyle(sev01) {
  const s = clamp01(sev01);
  if (s >= 0.85) return { stroke: "#ef4444", fill: "rgba(239,68,68,0.22)" };
  if (s >= 0.6) return { stroke: "#f59e0b", fill: "rgba(245,158,11,0.18)" };
  if (s > 0) return { stroke: "#22c55e", fill: "rgba(34,197,94,0.14)" };
  return { stroke: "rgba(255,255,255,0.25)", fill: "rgba(255,255,255,0.06)" };
}

function MapClickHandler({ enabled, onPick }) {
  useMapEvents({
    click(e) {
      if (enabled && onPick) {
        onPick({
          lat: e.latlng.lat,
          lon: e.latlng.lng,
        });
      }
    },
  });
  return null;
}

function TowerPopupCard({ tower, kpi, onViewDetails }) {
  const traffic = clamp01(kpi?.traffic ?? tower?.severity ?? 0);
  const sevPct = Math.round(traffic * 100);
  const st = statusFromTraffic(traffic);
  const displayName = tower?.name ?? `Tower ${tower?.id ?? ""}`;

  return (
    <div
      style={{
        width: 260,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          padding: "12px 12px 10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "rgba(255,255,255,0.92)" }}>
            {displayName}
          </div>

          <div
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              fontSize: 12,
              fontWeight: 900,
              color: st.color,
              textTransform: "capitalize",
              lineHeight: "16px",
              height: 22,
            }}
          >
            {st.label}
          </div>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 8, columnGap: 12 }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Status</div>
          <div style={{ color: st.color, fontWeight: 900, fontSize: 12, textTransform: "capitalize" }}>
            {st.label}
          </div>

          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Severity</div>
          <div style={{ color: "rgba(255,255,255,0.90)", fontWeight: 900, fontSize: 12 }}>
            {sevPct}%
          </div>

          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>ID</div>
          <div style={{ color: "rgba(255,255,255,0.90)", fontWeight: 900, fontSize: 12 }}>
            {tower?.id}
          </div>
        </div>

        <button
          onClick={onViewDetails}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(37,99,235,0.95)",
            color: "rgba(255,255,255,0.95)",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
function ZonePopupCard({ zone }) {
  const sev = clamp01(zone?.severity ?? 0);
  const sevPct = Math.round(sev * 100);
  const style = zoneStyle(sev);
  const towers = zone?.affected_towers ?? [];

  return (
    <div style={{ width: 280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "rgba(255,255,255,0.92)" }}>
          Affected Zone
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
            fontSize: 12,
            fontWeight: 900,
            color: style.stroke,
          }}
        >
          Severity {sevPct}%
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.80)" }}>
        {zone?.reason || "No reason provided."}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
        Towers: {towers.length ? towers.join(", ") : "—"}
      </div>

      {Array.isArray(zone?.actions) && zone.actions.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.80)" }}>
            Planned Actions
          </div>
          <ul style={{ margin: "6px 0 0 16px", padding: 0, color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
            {zone.actions.slice(0, 4).map((a, idx) => (
              <li key={idx}>
                <span style={{ fontWeight: 800 }}>{a.type}</span>
                {a.type === "load_balance" && a.shift_percent != null && (
                  <> — shift {a.shift_percent}%</>
                )}
                {a.type === "scale_capacity" && a.amount != null && (
                  <> — +{a.amount}</>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {zone?.confidence != null && (
        <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          Confidence: {Math.round(clamp01(zone.confidence) * 100)}%
        </div>
      )}
    </div>
  );
}

export default function CoverageMap({
  towers,
  center,
  zoom = 5,
  kpiById = {},
  affectedAreas = [],
  pickingEventLocation = false,
  onPickLocation,
  onSelectTower,
}) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler enabled={pickingEventLocation} onPick={onPickLocation} />

        {/*Affected Zone Overlays */}
        {Array.isArray(affectedAreas) &&
          affectedAreas
            .filter((z) => z?.center?.lat != null && z?.center?.lon != null)
            .map((z) => {
              const sev = clamp01(z.severity ?? 0);
              const style = zoneStyle(sev);
              const radiusM =
                typeof z.radius_m === "number"
                  ? z.radius_m
                  : 700 + sev * 1300;

              return (
                <Circle
                  key={z.id ?? `${z.center.lat}_${z.center.lon}`}
                  center={[z.center.lat, z.center.lon]}
                  radius={radiusM}
                  pathOptions={{
                    color: style.stroke,
                    fillColor: style.fill,
                    fillOpacity: 1,
                    weight: 2,
                  }}
                >
                  <Popup closeButton={true} autoPan={true}>
                    <ZonePopupCard zone={z} />
                  </Popup>
                </Circle>
              );
            })}

        {/* Towers */}
        {towers.map((t) => {
          const kpi = kpiById[t.id];

          return (
            <CircleMarker
              key={t.id}
              center={[t.lat, t.lon]}
              radius={5}
              pathOptions={{
                color: colorFromTraffic(kpi?.traffic),
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onSelectTower?.(t.id),
              }}
            >
              <Popup closeButton={true} autoPan={true}>
                <TowerPopupCard
                  tower={t}
                  kpi={kpi}
                  onViewDetails={() => onSelectTower?.(t.id)}
                />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
