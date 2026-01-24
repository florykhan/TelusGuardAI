import EventPanel from "../components/EventPanel";
import CoverageMap from "../components/CoverageMap";
import DetailsPanel from "../components/DetailsPanel";
import ActionLog from "../components/ActionLog";

export default function DashboardPage({
  towers,
  setTowers,
  selectedTower,
  setSelectedTower,
  aiActions,
  setAiActions,
  onAnalyze,
  loading,
  error,
}) {
  const center = [56.1304, -106.3468];

  return (
    <div style={{ display: "flex", height: "100vh", gap: 8 }}>
      
      {/* Left panel: Event input */}
      <div style={{ width: "20%", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <EventPanel onAnalyze={onAnalyze} loading={loading} />
      </div>

      {/* Center panel: Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <CoverageMap
          towers={towers}
          center={center}
          zoom={4}
          onSelectTower={(towerId) => {
            const tower = towers.find((t) => t.id === towerId);
            setSelectedTower(tower);
          }}
        />
      </div>

      {/* Right panel: Tower details + action log */}
      <div style={{ width: "25%", borderLeft: "1px solid #ccc", overflowY: "auto", padding: 8 }}>
        <DetailsPanel tower={selectedTower} />
        <ActionLog actions={aiActions} />
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
