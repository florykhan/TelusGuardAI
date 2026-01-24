import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import towersData from "../data/telus_towers.json";
import CoverageMap from "../components/CoverageMap.jsx";

export default function CoverageMapPage() {
  const [radio, setRadio] = useState("ALL");

  const radios = useMemo(() => {
    const set = new Set(towersData.map((t) => t.radio));
    return ["ALL", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    if (radio === "ALL") return towersData;
    return towersData.filter((t) => t.radio === radio);
  }, [radio]);

  // Canada-ish center
  const center = [56.1304, -106.3468];

  const MAX_RENDER = 5000;
  const toRender = filtered.slice(0, MAX_RENDER);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>TELUS Towers Map (Coverage Proxy)</h1>
          <p style={{ marginTop: 6, opacity: 0.75 }}>
            Showing {toRender.length} / {filtered.length} towers
          </p>
        </div>
        <Link to="/">Back</Link>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <label>
          Radio:
          <select value={radio} onChange={(e) => setRadio(e.target.value)} style={{ marginLeft: 8 }}>
            {radios.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <div style={{ opacity: 0.8 }}>
          Tip: start zoomed in for better performance.
        </div>
      </div>

      <CoverageMap towers={toRender} center={center} zoom={4} />
    </div>
  );
}
