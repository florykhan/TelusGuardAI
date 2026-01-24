import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function CoverageMap({ towers, center, zoom = 5 }) {
  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {towers.map((t) => (
          <CircleMarker
            key={t.id}
            center={[t.lat, t.lon]}
            radius={4}
          >
            <Popup>
              <div>
                <div><b>ID:</b> {t.id}</div>
                <div><b>Radio:</b> {t.radio}</div>
                {t.range != null && <div><b>Range:</b> {t.range} m</div>}
                {t.samples != null && <div><b>Samples:</b> {t.samples}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
