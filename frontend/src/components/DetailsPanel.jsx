function clamp01(x) {
  return Math.max(0, Math.min(1, x ?? 0));
}

function severityLabel(sev01) {
  if (sev01 >= 0.85) return { label: "critical", color: "#ef4444" };
  if (sev01 >= 0.6) return { label: "warning", color: "#f59e0b" };
  if (sev01 > 0) return { label: "online", color: "#22c55e" };
  return { label: "online", color: "#22c55e" };
}

function formatPct01(x) {
  return `${Math.round(clamp01(x) * 100)}%`;
}

function formatMs(x) {
  return `${Math.round(x ?? 0)}ms`;
}

function formatLoss01(x) {
  return `${(clamp01(x) * 100).toFixed(2)}%`;
}

function formatW(x) {
  return `${Math.round(x ?? 0)}W`;
}
function Sparkline({ data = [] }) {
  const w = 260;
  const h = 70;
  const pad = 6;

  const pts = (data.length ? data : [40, 45, 42, 55, 60, 58, 62, 56]).map(
    (v, i) => ({ x: i, y: v })
  );

  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const scaleX = (i) =>
    pad + (i * (w - pad * 2)) / Math.max(1, pts.length - 1);
  const scaleY = (v) => {
    if (maxY === minY) return h / 2;
    const t = (v - minY) / (maxY - minY);
    return h - pad - t * (h - pad * 2);
  };

  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`)
    .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <path d={d} fill="none" stroke="rgba(59,130,246,0.9)" strokeWidth="2" />
      <path
        d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
        fill="rgba(59,130,246,0.10)"
      />
    </svg>
  );
}

function MetricCard({ title, value, delta, deltaColor }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
        {title}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
        {delta != null && (
          <div style={{ fontSize: 12, fontWeight: 800, color: deltaColor ?? "rgba(255,255,255,0.7)" }}>
            {delta}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color }) {
  return (
    <button
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: color,
        color: "rgba(255,255,255,0.95)",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
    </button>
  );
}

export default function DetailsPanel({ tower }) {
  if (!tower) return null;

  const sev = clamp01(tower.severity ?? tower.kpi?.traffic ?? 0);
  const s = severityLabel(sev);
  const traffic = clamp01(tower.kpi?.traffic ?? sev);
  const latency = tower.kpi?.latency ?? Math.round(14 + sev * 40);
  const loss = clamp01(tower.kpi?.loss ?? sev * 0.02);
  const energy = tower.kpi?.energy ?? Math.round(65 + sev * 12);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 900 }}>
          {tower.name ?? tower.id}
        </div>
        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
            fontSize: 12,
            color: s.color,
            fontWeight: 900,
            textTransform: "capitalize",
          }}
        >
          {s.label}
        </div>
      </div>

      {/* Severity Bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
          Severity Score
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: `${Math.round(sev * 100)}%`,
              height: "100%",
              background: s.color,
            }}
          />
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
          {Math.round(sev * 100)}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>
          Performance Metrics
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MetricCard
            title="Traffic Load"
            value={formatPct01(traffic)}
            delta={sev > 0.7 ? "+12%" : "+3%"}
            deltaColor="#ef4444"
          />
          <MetricCard
            title="Latency"
            value={formatMs(latency)}
            delta={sev > 0.7 ? "-8ms" : "-2ms"}
            deltaColor="#22c55e"
          />
          <MetricCard
            title="Packet Loss"
            value={formatLoss01(loss)}
            delta={sev > 0.7 ? "-0.5%" : "-0.1%"}
            deltaColor="#22c55e"
          />
          <MetricCard
            title="Energy Use"
            value={formatW(energy)}
            delta={sev > 0.7 ? "+5W" : "+1W"}
            deltaColor="#ef4444"
          />
        </div>
      </div>

      {/* Trend */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>
          Severity Trend (1h)
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Sparkline />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            <span>0m</span><span>10m</span><span>25m</span><span>35m</span><span>45m</span><span>55m</span>
          </div>
        </div>
      </div>

      {/* Recommended actions */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>
          AI Recommended Actions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ActionButton icon="⚡" label="Optimize Load Balancing" color="rgba(37,99,235,0.95)" />
          <ActionButton icon="📶" label="Adjust Frequency Band" color="rgba(168,85,247,0.92)" />
          <ActionButton icon="🗓️" label="Schedule Maintenance" color="rgba(255,255,255,0.06)" />
        </div>
      </div>
    </div>
  );
}
