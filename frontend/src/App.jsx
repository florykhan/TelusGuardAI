import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";

const MOCK_TOWERS = [
  { id: "TWR_101", lat: 49.2767, lon: -123.112, radio: "LTE", severity: 0 },
  { id: "TWR_087", lat: 49.28, lon: -123.115, radio: "5G", severity: 0 },
  { id: "TWR_103", lat: 49.277, lon: -123.11, radio: "LTE", severity: 0 },
  { id: "TWR_090", lat: 49.279, lon: -123.114, radio: "5G", severity: 0 },
];
function mapSeverityToNumber(sev) {
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
      await new Promise((r) => setTimeout(r, 700));
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
                  {
                    type: "scale_capacity",
                    amount: 1,
                  },
                ],
              },
            ],
          },
        ],
      };
      const areas = aiResponse.events.flatMap(event =>
        event.affected_areas.map(area => ({
          name: area.area_name,
          severity: area.severity,
          center: area.center,
          latRange: area.lat_range,
          longRange: area.long_range,
          confidence: area.confidence
        }))
      );

setAffectedAreas(areas);
      const affectedAreas = aiResponse.events.flatMap(
        (ev) => ev.affected_areas
      );
      setTowers((prevTowers) =>
        prevTowers.map((t) => {
          const area = affectedAreas.find(
            (a) =>
              a.affected_towers?.includes(t.id)
          );

          const severityValue =
            typeof area?.severity === "string"
              ? mapSeverityToNumber(area.severity)
              : area?.severity ?? 0;

          return {
            ...t,
            severity: severityValue,
            kpi: {
              traffic: severityValue,
              latency: area?.latency ?? 0,
              loss: area?.packet_loss ?? 0,
              updatedAt: new Date(),
            },
          };
        })
      );
      setAiActions(
        affectedAreas.flatMap((area) =>
          (area.actions || []).map((a) => ({
            timestamp: new Date().toLocaleTimeString(),
            type: a.type,
            details:
              a.type === "load_balance"
                ? `Shift ${a.shift_percent}% → ${a.to_towers.join(", ")}`
                : `Scale capacity by ${a.amount}`,
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
      />
    </div>
  );
}
