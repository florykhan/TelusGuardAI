import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";

const MOCK_TOWERS = [
  { id: "TWR_101", lat: 49.2767, lon: -123.112, radio: "LTE", severity: 0 },
  { id: "TWR_087", lat: 49.28, lon: -123.115, radio: "5G", severity: 0 },
  { id: "TWR_103", lat: 49.277, lon: -123.11, radio: "LTE", severity: 0 },
  { id: "TWR_090", lat: 49.279, lon: -123.114, radio: "5G", severity: 0 },
];

function mapSeverity01(sev) {
  if (typeof sev === "number") return Math.max(0, Math.min(1, sev));
  switch (sev) {
    case "critical":
      return 1;
    case "high":
      return 0.85;
    case "moderate":
      return 0.6;
    case "low":
      return 0.3;
    default:
      return 0;
  }
}
function computeZoneCenterFromTowers(affectedTowerIds, towers) {
  const pts = towers.filter((t) => affectedTowerIds.includes(t.id));
  if (!pts.length) return null;
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lon = pts.reduce((s, p) => s + p.lon, 0) / pts.length;
  return { lat, lon };
}

function normalizeZones(aiResponse, towers) {
  const events = aiResponse?.events ?? [];
  const zones = [];

  events.forEach((ev) => {
    (ev.affected_areas ?? []).forEach((area, idx) => {
      const affectedTowers = area.affected_towers ?? [];
      const severity01 = mapSeverity01(area.severity);

      zones.push({
        id: `${ev.id ?? "event"}_${idx}`,
        eventId: ev.id ?? "event",
        severity: severity01,
        affected_towers: affectedTowers,
        reason: area.reason ?? "",
        actions: area.actions ?? [],
        center:
          area.center ??
          computeZoneCenterFromTowers(affectedTowers, towers) ??
          null,
        confidence: area.confidence ?? Math.min(0.99, 0.6 + severity01 * 0.35),
        latency: area.latency,
        packet_loss_percent: area.packet_loss,
      });
    });
  });

  return zones;
}

export default function App() {
  const [towers, setTowers] = useState(MOCK_TOWERS);
  const [selectedTower, setSelectedTower] = useState(null);
  const [aiActions, setAiActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [affectedAreas, setAffectedAreas] = useState([]);

  const handleAnalyze = async (prompt) => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setAiActions([]);

    try {
      await new Promise((r) => setTimeout(r, 500));
      const aiResponse = {
        events: [
          {
            id: "crowd_spike_001",
            affected_areas: [
              {
                severity: "high",
                affected_towers: ["TWR_101", "TWR_087"],
                latency: 120,
                packet_loss: 2.3,
                reason: "High expected crowd + towers already at 70% load",
                actions: [
                  {
                    type: "load_balance",
                    shift_percent: 20,
                    to_towers: ["TWR_103", "TWR_090"],
                  },
                  { type: "scale_capacity", amount: 1 },
                ],
              },
            ],
          },
        ],
      };
      const zones = normalizeZones(aiResponse, towers);
      setAffectedAreas(zones);
      setTowers((prevTowers) =>
        prevTowers.map((t) => {
          const zone = zones.find((z) => z.affected_towers.includes(t.id));
          const sev = zone?.severity ?? 0;

          const latency = typeof zone?.latency === "number" ? zone.latency : 20 + sev * 100;
          const lossFraction =
            typeof zone?.packet_loss_percent === "number"
              ? zone.packet_loss_percent / 100
              : sev * 0.02;

          return {
            ...t,
            severity: sev,
            kpi: {
              traffic: sev,
              latency,
              loss: lossFraction,
              updatedAt: new Date().toISOString(),
            },
          };
        })
      );
      setAiActions(
        zones.flatMap((z) =>
          (z.actions || []).map((a) => ({
            timestamp: new Date().toLocaleTimeString(),
            type: a.type,
            details:
              a.type === "load_balance"
                ? `Shift ${a.shift_percent}% → ${(a.to_towers || []).join(", ")}`
                : a.type === "scale_capacity"
                  ? `Scale capacity by ${a.amount}`
                  : JSON.stringify(a),
            meta: {
              reason: z.reason,
              confidence: z.confidence,
              severity: z.severity,
            },
          }))
        )
      );
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ height: "100vh" }}>
      <DashboardPage
        towers={towers}
        setTowers={setTowers}
        selectedTower={selectedTower}
        setSelectedTower={setSelectedTower}
        aiActions={aiActions}
        setAiActions={setAiActions}
        onAnalyze={handleAnalyze}
        loading={loading}
        error={error}
        affectedAreas={affectedAreas}
      />
    </div>
  );
}
