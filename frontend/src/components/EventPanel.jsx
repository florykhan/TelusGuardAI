import { useState } from "react";

export default function EventPanel({ onAnalyze, loading }) {
  const [prompt, setPrompt] = useState("");

  const INCIDENTS = [
    { label: "Stadium Surge", prompt: "Concert at BC Place tonight (stadium surge)" },
    { label: "Traffic Spike", prompt: "Traffic spike downtown at 7PM" },
    { label: "Tower Outage", prompt: "Tower outage at Main St & 3rd Ave" },
    { label: "Packet Loss Spike", prompt: "Packet loss spike near BC Place" },
  ];

  const run = (p) => {
    if (!p.trim()) return;
    setPrompt(p);
    onAnalyze(p);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Event Panel</h2>

      <textarea
        style={{ width: "100%", height: 70, marginBottom: 8, padding: 8 }}
        placeholder="Enter event prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={() => run(prompt)}
        disabled={loading || !prompt.trim()}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 12,
          backgroundColor: loading ? "#ccc" : "#1976d2",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {loading ? "Analyzing..." : "Analyze Event"}
      </button>

      <div style={{ marginTop: 6 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Incident Simulator</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {INCIDENTS.map((x) => (
            <button
              key={x.label}
              onClick={() => run(x.prompt)}
              disabled={loading}
              style={{
                width: "100%",
                padding: 10,
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 800 }}>{x.label}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{x.prompt}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}