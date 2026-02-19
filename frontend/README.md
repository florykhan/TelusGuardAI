# TelusGuardAI Frontend

React + Vite frontend for the **Network Impact Analyzer**: interactive map (Leaflet), query input, tower details, and impact reports. Deployed on GitHub Pages.

---

## 📄 Full Documentation

All detailed setup, environment, deployment, error handling, and project context (agents, datasets, APIs) are in the **project report:**

👉 **[REPORT.md](../REPORT.md)**

---

## 🧱 Frontend Structure

Exact folder layout:

```
frontend/
├── public/                                  # Static assets served by the app
├── src/                                     # Application source code
│   ├── components/                          # React components
│   │   ├── CoverageMap.jsx                  # Interactive Leaflet map component
│   │   ├── EventPanel.jsx                   # Query input and analysis trigger
│   │   ├── DetailsPanel.jsx                 # Tower details and KPI display
│   │   ├── ImpactAreaReport.jsx             # Affected area analysis report
│   │   ├── SafetyPanel.jsx                  # Network safety metrics
│   │   └── ...
│   ├── pages/                               # Page components
│   │   ├── DashboardPage.jsx                # Main dashboard layout
│   │   └── CoverageMapPage.jsx              # Map-focused view
│   ├── data/                                # Static data files
│   │   └── telus_towers.json                # Tower location data
│   ├── assets/                              # Images and assets
│   ├── lib/                                 # Frontend utility libraries
│   ├── App.jsx                              # Main application component
│   └── main.jsx                             # Application entry point
├── .env.example                             # Environment variable template (VITE_BACKEND_URL)
├── package.json                             # Node.js dependencies
└── vite.config.js                           # Vite build configuration
```

---

## 🧰 Quick Start

```bash
npm install
# optional: copy .env.example to .env and set VITE_BACKEND_URL
npm run dev
```

Dev server: **http://localhost:5173**. Backend URL: `VITE_BACKEND_URL` or default `http://localhost:5000`.

**Build:** `npm run build` → output in `dist/`. Set `VITE_BACKEND_URL` before building for production. See **[REPORT.md](../REPORT.md)** for deployment and full details.
