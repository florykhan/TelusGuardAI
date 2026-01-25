function StatusRow({ label, value, color }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        marginBottom: 6,
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.65)" }}>{label}</span>
      <span style={{ fontWeight: 900, color }}>{value}</span>
    </div>
  );
}

export default function SafetyPanel({
  confidence = 0.92,
  blastRadius = 0.2,
  cooldownActive = true,
  rollbackReady = true,
  lastActionStatus = "success",
}) {
  const confidenceColor =
    confidence >= 0.85 ? "#22c55e" : confidence >= 0.6 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 10 }}>
        Autonomous Safety Monitor
      </div>

      <StatusRow
        label="Confidence"
        value={`${Math.round(confidence * 100)}%`}
        color={confidenceColor}
      />

      <StatusRow
        label="Blast Radius"
        value={`${Math.round(blastRadius * 100)}%`}
        color={blastRadius <= 0.25 ? "#22c55e" : "#f59e0b"}
      />

      <StatusRow
        label="Cooldown"
        value={cooldownActive ? "Active" : "Idle"}
        color={cooldownActive ? "#f59e0b" : "#22c55e"}
      />

      <StatusRow
        label="Rollback"
        value={rollbackReady ? "Ready" : "Unavailable"}
        color={rollbackReady ? "#22c55e" : "#ef4444"}
      />

      <StatusRow
        label="Last Action"
        value={lastActionStatus}
        color={lastActionStatus === "success" ? "#22c55e" : "#ef4444"}
      />
    </div>
  );
}

