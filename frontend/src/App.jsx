import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";
const ANALYZE_PATH = "/api/analyze-network-impact";

function mapSeverity01(sev) {
  if (typeof sev === "number") return Math.max(0, Math.min(1, sev));
  const s = (sev || "").toLowerCase();
  switch (s) {
    case "critical":
      return 1;
    case "high":
      return 0.85;
    case "moderate":
      return 0.6;
    case "low":
      return 0.3;
    default:
      return 0.5;
  }
}

function normalizeZones(agentResponse) {
  const events = agentResponse?.events ?? [];
  const zones = [];

  events.forEach((ev) => {
    const eventId = ev.event_id ?? ev.id ?? "event";
    (ev.affected_areas ?? []).forEach((area, idx) => {
      const severity01 = mapSeverity01(area.severity);
      zones.push({
        id: `${eventId}_${idx}`,
        eventId,
        severity: severity01,
        affected_towers: area.affected_towers ?? [],
        reason: area.reasoning ?? area.reason ?? "",
        actions: area.mitigation_actions ?? area.actions ?? [],
        center: area.center ?? null,
        confidence: area.confidence ?? Math.min(0.99, 0.6 + severity01 * 0.35),
        latency: area.latency,
        packet_loss_percent: area.packet_loss,
      });
    });
  });

  return zones;
}

function deriveAiActions(zones) {
  return zones.flatMap((z) =>
    (z.actions || []).map((a) => {
      const item = typeof a === "string" ? { type: "mitigation", details: a } : a;
      return {
        timestamp: new Date().toLocaleTimeString(),
        type: item.type ?? "mitigation",
        details:
          item.type === "load_balance"
            ? `Shift ${item.shift_percent ?? "?"}% → ${(item.to_towers || []).join(", ")}`
            : item.type === "scale_capacity"
              ? `Scale capacity by ${item.amount ?? "?"}`
              : typeof item === "string"
                ? item
                : JSON.stringify(item),
        meta: { reason: z.reason, confidence: z.confidence, severity: z.severity },
      };
    })
  );
}

export default function App() {
  const [selectedTower, setSelectedTower] = useState(null);
  const [aiActions, setAiActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [affectedAreas, setAffectedAreas] = useState([]);
  const [agentResponse, setAgentResponse] = useState(null);

  const handleAnalyze = async (prompt) => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setAiActions([]);

    try {
      const res = await fetch(`${API_BASE}${ANALYZE_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          options: { max_areas: 10, min_confidence: 0.7, include_reasoning: true },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend ${res.status}: ${text}`);
      }

      const data = await res.json();
      setAgentResponse(data);
      const zones = normalizeZones(data);
      setAffectedAreas(zones);
      setAiActions(deriveAiActions(zones));
    } catch (e) {
      console.error(e);
      // Improve error messages for network failures
      let errorMessage = "Something went wrong. Please try again.";
      if (e instanceof TypeError && e.message.includes("fetch")) {
        errorMessage = `Cannot connect to backend at ${API_BASE}. Please ensure the backend server is running and accessible.`;
      } else if (e.message.includes("CORS") || e.message.includes("Failed to fetch")) {
        errorMessage = `Backend connection failed. Check if ${API_BASE} is accessible and CORS is configured correctly.`;
      } else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ height: "100vh" }}>
      <DashboardPage
        selectedTower={selectedTower}
        setSelectedTower={setSelectedTower}
        aiActions={aiActions}
        setAiActions={setAiActions}
        onAnalyze={handleAnalyze}
        loading={loading}
        error={error}
        affectedAreas={affectedAreas}
        agentResponse={agentResponse}
      />
    </div>
  );
}
