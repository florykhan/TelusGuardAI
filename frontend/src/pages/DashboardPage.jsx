import EventPanel from "../components/EventPanel";
import CoverageMap from "../components/CoverageMap";
import DetailsPanel from "../components/DetailsPanel";
import ActionLog from "../components/ActionLog";
import EmptySelectionPanel from "../components/EmptySelectionPanel";
import SafetyPanel from "../components/SafetyPanel";

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
  affectedAreas,
}) {
  const center = [56.1304, -106.3468];
  const kpiById = Object.fromEntries(
    towers
      .filter((t) => !!t.kpi)
      .map((t) => [t.id, t.kpi])
  );

  return (
    <div className="noc-shell">
      <div className="noc-grid">
        {/* LEFT COLUMN */}
        <div className="noc-col noc-left">
          <div className="noc-col-inner">
            <div className="noc-section">
              <div className="noc-title">Event Analysis</div>
              <EventPanel onAnalyze={onAnalyze} loading={loading} />
            </div>

            {affectedAreas?.length > 0 && (
              <div className="noc-section">
                <div className="noc-title">Affected Zones</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {affectedAreas.map((z) => (
                    <div key={z.id} className="noc-card">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 900 }}>
                          Severity: {(z.severity * 100).toFixed(0)}%
                        </div>
                        <div className="noc-pill">
                          Conf {(z.confidence * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="noc-muted" style={{ fontSize: 12, marginTop: 6 }}>
                        Towers: {(z.affected_towers || []).join(", ")}
                      </div>

                      <div style={{ fontSize: 13, marginTop: 8 }}>
                        {z.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="noc-col noc-center">
          <div className="noc-col-inner">
            <div
              className="noc-section"
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              <div className="noc-title" style={{ margin: 0, flex: 1 }}>
                Network Coverage Map
              </div>
              <span className="noc-pill">● Online</span>
              <span className="noc-pill">● Warning</span>
              <span className="noc-pill">● Critical</span>
            </div>

            <div style={{ padding: 12, height: "100%" }}>
              <div
                style={{
                  height: "calc(100vh - 96px)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <CoverageMap
                  towers={towers}
                  center={center}
                  zoom={4}
                  kpiById={kpiById}
                  affectedAreas={affectedAreas}

                  onSelectTower={(towerId) => {
                    const tower = towers.find((t) => t.id === towerId);
                    setSelectedTower(tower ?? null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="noc-col noc-right">
          <div className="noc-col-inner">
            <div className="noc-section">
              {selectedTower ? (
                <>
                  <DetailsPanel tower={selectedTower} />
                  <SafetyPanel
                    confidence={affectedAreas?.[0]?.confidence ?? 0.92}
                    blastRadius={0.2}
                    cooldownActive={true}
                    rollbackReady={true}
                    lastActionStatus={aiActions.length ? "success" : "idle"}
                  />

                  <ActionLog actions={aiActions} />

                </>
              ) : (
                <EmptySelectionPanel />
              )}

              {error && (
                <div style={{ color: "#f87171", marginTop: 10 }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
