export default function ActionLog({ actions }) {
  if (!actions || actions.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h3>AI Actions Log</h3>
        <p>No actions yet. Run an analysis to see mitigation steps.</p>
      </div>
    );
  }
  return (
    <div style={{ padding: 16 }}>
      <h3>AI Actions Log</h3>
      <ul style={{ listStyle: "none", padding: 0, maxHeight: "40vh", overflowY: "auto" }}>
        {actions.map((a, idx) => (
          <li key={idx} style={{ marginBottom: 8, padding: 6, borderBottom: "1px solid #eee" }}>
            <div><b>Time:</b> {a.timestamp}</div>
            <div><b>Action:</b> {a.type}</div>
            <div><b>Details:</b> {a.details}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
