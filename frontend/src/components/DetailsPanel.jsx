export default function DetailsPanel({ tower }) {
  if (!tower) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Tower Details</h3>
        <p>Select a tower on the map to see details.</p>
      </div>
    );
  }
  return (
    <div style={{ padding: 16, marginBottom: 16, borderBottom: "1px solid #ccc" }}>
      <h3>Tower Details</h3>
      <div><b>ID:</b> {tower.id}</div>
      <div><b>Radio:</b> {tower.radio}</div>
      <div><b>Latitude:</b> {tower.lat}</div>
      <div><b>Longitude:</b> {tower.lon}</div>
      <div><b>Severity:</b> {(tower.severity * 100).toFixed(0)}%</div>
      {tower.kpi && (
        <>
          <div><b>Traffic:</b> {(tower.kpi.traffic * 100).toFixed(0)}%</div>
          <div><b>Latency:</b> {tower.kpi.latency.toFixed(1)} ms</div>
          <div><b>Packet Loss:</b> {(tower.kpi.loss * 100).toFixed(2)}%</div>
        </>
      )}
    </div>
  );
}
