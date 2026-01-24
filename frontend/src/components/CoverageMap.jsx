import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
function colorFromTraffic(traffic) {
  if (traffic == null) return "#3388ff";
  if (traffic > 0.8) return "#e53935";
  if (traffic > 0.5) return "#fb8c00";
  return "#43a047";
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

export default function CoverageMap({
  towers,
  center,
  zoom = 5,
  kpiById = {},
  pickingEventLocation = false,
  onPickLocation,
  onSelectTower,
}) {
  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          enabled={pickingEventLocation}
          onPick={onPickLocation}
        />

        {towers.map((t) => {
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
                  <div><b>ID:</b> {t.id}</div>
                  <div><b>Radio:</b> {t.radio}</div>

                  {kpi && (
                    <>
                      <hr />
                      <div><b>Traffic:</b> {(kpi.traffic * 100).toFixed(0)}%</div>
                      <div><b>Latency:</b> {kpi.latency.toFixed(1)} ms</div>
                      <div><b>Packet Loss:</b> {(kpi.loss * 100).toFixed(2)}%</div>
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
    </div>
  );
}
