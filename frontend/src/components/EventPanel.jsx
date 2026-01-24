import { useState } from "react";

export default function EventPanel({ onAnalyze, loading }) {
  const [prompt, setPrompt] = useState("");
  const SAMPLE_PROMPTS = [
    "Concert at BC Place tonight",
    "Traffic spike downtown at 7PM",
    "Tower outage at Main St & 3rd Ave",
  ];
  const handleAnalyzeClick = () => {
    if (!prompt.trim()) return;
    onAnalyze(prompt);
  };

  const handleUseSample = (sample) => {
    setPrompt(sample);
    onAnalyze(sample);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Event Panel</h2>

      {/* Input box */}
      <textarea
        style={{ width: "100%", height: 60, marginBottom: 8, padding: 8 }}
        placeholder="Enter event prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {/* Analyze button */}
      <button
        onClick={handleAnalyzeClick}
        disabled={loading || !prompt.trim()}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 12,
          backgroundColor: loading ? "#ccc" : "#1976d2",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Event"}
      </button>

      {/* Sample prompts */}
      <div style={{ marginTop: 8 }}>
        <p style={{ margin: "4px 0", fontWeight: "bold" }}>Try a sample:</p>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleUseSample(sample)}
            disabled={loading}
            style={{
              display: "block",
              width: "100%",
              margin: "4px 0",
              padding: 6,
              backgroundColor: "#eee",
              border: "1px solid #ccc",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
}
