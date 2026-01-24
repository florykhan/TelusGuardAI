import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import towersData from "../data/telus_towers.json";
import CoverageMap from "../components/CoverageMap.jsx";

export default function CoverageMapPage() {
  const [radio, setRadio] = useState("ALL");
  const [kpiById, setKpiById] = useState({});
  const [selectedTower, setSelectedTower] = useState(null);
  const [pickingEventLocation, setPickingEventLocation] = useState(false);

  const radios = useMemo(() => {
    const set = new Set(towersData.map((t) => t.radio));
    return ["ALL", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    if (radio === "ALL") return towersData;
    return towersData.filter((t) => t.radio === radio);
  }, [radio]);
  const MAX_RENDER = 5000;
  const toRender = filtered.slice(0, MAX_RENDER);
  const center = [56.1304, -106.3468];
  useEffect(() => {
    const interval = setInterval(() => {
      setKpiById((prev) => {
        const next = { ...prev };
        toRender.forEach((t) => {
          next[t.id] = {
            traffic: Math.random(),
            latency: 20 + Math.random() * 80,
            loss: Math.random() * 0.05,
            updatedAt: new Date().toISOString(),
          };
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [toRender]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>TELUS Towers – Live Network View</h1>
          <p style={{ marginTop: 6, opacity: 0.75 }}>
            Showing {toRender.length} / {filtered.length} towers
          </p>
        </div>
        <Link to="/">Back</Link>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "12px 0" }}>
        <label>
          Radio:
          <select value={radio} onChange={(e) => setRadio(e.target.value)} style={{ marginLeft: 8 }}>
            {radios.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <button
          onClick={() => setPickingEventLocation((v) => !v)}
          style={{
            padding: "6px 10px",
            cursor: "pointer",
            background: pickingEventLocation ? "#222" : "#eee",
            color: pickingEventLocation ? "#fff" : "#000",
            border: "1px solid #aaa",
          }}
        >
          {pickingEventLocation ? "Click map to place event…" : "Pick event location"}
        </button>

        {selectedTower && (
          <div style={{ opacity: 0.8 }}>
            Selected tower: <b>{selectedTower}</b>
          </div>
        )}
      </div>

      <CoverageMap
        towers={toRender}
        center={center}
        zoom={4}
        kpiById={kpiById}
        pickingEventLocation={pickingEventLocation}
        onPickLocation={(loc) => {
          console.log("Picked event location:", loc);
          setPickingEventLocation(false);
        }}
        onSelectTower={setSelectedTower}
      />
    </div>
  );
}
