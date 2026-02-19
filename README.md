# 📡 TelusGuardAI — Network Impact Analyzer

An **AI-powered network impact analysis system** that processes natural language queries about service disruptions, gathers intelligence from web and weather sources, and produces geospatial impact assessments with severity and confidence scores. Built with a **multi-agent orchestration** (Flask backend + React frontend).

---

## 🎯 Project Overview

The goal of this project is to:

- **Automate** network impact analysis from natural language (e.g. “What areas were affected by the ice storm in Toronto?”).
- **Aggregate** multi-source intelligence (web search + OpenWeatherMap).
- **Generate** geospatial impact (affected areas, coordinates, severity, confidence).
- **Visualize** coverage and impact on an interactive Leaflet map.

This system addresses **rapid, data-driven network outage analysis** during weather events, infrastructure failures, and other disruptions. **Target users:** NOC engineers, telecom providers, emergency response, technical reviewers.

---

## 🌐 Live Demo

The app is deployed on **GitHub Pages** with the backend on **Render**. Try it here: **[https://florykhan.github.io/TelusGuardAI/](https://florykhan.github.io/TelusGuardAI/)**

> ⚠️ **It is important:**  
> **Real-time KPIs are working**, but **agent responses are not**. The reason is that the **API keys have expired** — they were provided by the organizers (Telus and Technation) **only for the Hackathon duration**. The keys are no longer valid, so the AI analysis pipeline does not return results. All API and backend calls are still registered in Render; the backend is running and the KPI endpoints work. To see full agent-based analysis, run the stack locally with your own API keys (see [REPORT.md](REPORT.md)).

---

## ✨ Key Features

- **Multi-agent AI orchestration** — Three specialized agents in sequence: Event Intelligence (query parsing) → Web Intelligence (search + weather) → Geospatial Reasoning (impact areas). Models: Gemma-3-27b, DeepSeek-v3-2, GPT-OSS-120b via **Telus AI Gateway**.
- **Natural language query processing** — Accepts questions like “What areas were affected by the ice storm in Toronto?” and extracts structured event metadata.
- **Web search & weather** — Parallel web searches (mock; ready for real API) and **OpenWeatherMap** integration for weather-related outages.
- **Geospatial reasoning** — LLM-derived affected areas with coordinates, severity (critical / high / moderate / low), and confidence scores (0–1).
- **Interactive map** — React + Leaflet: tower locations, impact zones, and heatmaps.
- **Real-time KPI monitoring** — Network metrics (traffic, latency, packet loss) per tower from backend services.
- **Caching** — 5-minute TTL to reduce API cost and improve performance.
- **Error handling** — User-friendly messages for backend failures; analysis errors shown in the UI.

---

## 🧱 Repository Structure

```
TelusGuardAI/
│
├── .github/                                 # GitHub configuration
│   └── workflows/
│       └── deploy-pages.yml                 # GitHub Actions: frontend → GitHub Pages
│
├── backend/                                 # Flask backend & multi-agent system
│   ├── agents/                              # AI agent implementations
│   │   ├── event_intelligence.py             # Agent 1: query parsing, metadata & search queries
│   │   ├── web_intelligence.py              # Agent 2: web search + weather aggregation
│   │   └── geospatial_reasoning.py          # Agent 3: geographic impact analysis
│   ├── models/                              # Data models and schemas
│   │   └── data_models.py                   # Event, AffectedArea, AnalysisResult
│   ├── services/                            # External service integrations
│   │   ├── ai_client.py                     # Unified client for AI model endpoints
│   │   ├── web_search.py                    # Web search (mock; ready for real API)
│   │   ├── weather_api.py                   # OpenWeatherMap API integration
│   │   ├── kpi_service.py                    # Network KPI data service
│   │   ├── tower_loader.py                   # Tower data loading utilities
│   │   └── ...
│   ├── utils/                               # Utility modules
│   │   ├── cache.py                         # In-memory caching with TTL
│   │   └── logger.py                        # Structured logging
│   ├── scripts/                             # Backend scripts
│   ├── app.py                               # Flask application entry point
│   ├── orchestrator.py                      # Main orchestration workflow
│   ├── config.py                            # Configuration and environment variables
│   └── requirements.txt                     # Python dependencies
│
├── frontend/                                # React frontend application
│   ├── public/                              # Static assets served by the app
│   ├── src/                                 # Application source code
│   │   ├── components/                      # React components
│   │   │   ├── CoverageMap.jsx              # Interactive Leaflet map
│   │   │   ├── EventPanel.jsx               # Query input and analysis trigger
│   │   │   ├── DetailsPanel.jsx             # Tower details and KPI display
│   │   │   └── ...
│   │   ├── pages/                           # Page components
│   │   │   ├── DashboardPage.jsx            # Main dashboard layout
│   │   │   └── CoverageMapPage.jsx           # Map-focused view
│   │   ├── data/                            # Static data files
│   │   │   └── telus_towers.json            # Tower location data
│   │   ├── assets/                          # Images and assets
│   │   ├── lib/                             # Frontend utility libraries
│   │   ├── App.jsx                          # Main application component
│   │   └── main.jsx                        # Application entry point
│   ├── .env.example                         # Environment variable template (VITE_BACKEND_URL)
│   ├── package.json                         # Node.js dependencies
│   └── vite.config.js                       # Vite build configuration
│
├── Procfile                                 # Render backend deployment configuration
├── .gitignore
├── README.md                                # Main overview and quick start
└── REPORT.md                                # Full project report
```

> 🗒️ **Note:**  
> The **backend** runs the multi-agent pipeline (Flask + orchestrator + agents). The **frontend** is a React SPA deployed to GitHub Pages and talks to the backend via `VITE_BACKEND_URL`. Full architecture, APIs, and deployment details are in **[REPORT.md](REPORT.md)**.

---

## 📄 Project Report

All detailed descriptions, architecture, APIs, deployment, env vars, limitations, and future work are in the project report: **[REPORT.md](REPORT.md)**.

---

## 🧰 Run Locally

You can run this project on your machine using **Python 3.12+** (backend) and **Node.js 20+** with **npm** (frontend).

### 1️⃣ Clone the repository

```bash
git clone https://github.com/florykhan/TelusGuardAI.git
cd TelusGuardAI
```

### 2️⃣ Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

Runs at `http://0.0.0.0:5001` (or `PORT` env).

### 3️⃣ Frontend

```bash
cd frontend
npm install
# optional: cp .env.example .env and set VITE_BACKEND_URL
npm run dev
```

Runs at `http://localhost:5173`. Default backend URL: `http://localhost:5000`. Set `VITE_BACKEND_URL` before `npm run build` for production.

For deployment, API endpoints, and limitations, see **[REPORT.md](REPORT.md)**.

---

## 🔐 Environment Variables

**Backend (optional):** `PORT`, `OPENWEATHER_API_KEY`, `FLASK_DEBUG`. AI tokens are in `config.py` for the hackathon; for production use env vars (see REPORT.md).

**Frontend (optional):** `VITE_BACKEND_URL` — backend base URL. Default: `http://localhost:5000`. Set before `npm run build` for production.

---

## 📊 APIs & Data

- **Telus AI Gateway** — LLM endpoints (Gemma-3-27b, DeepSeek-v3-2, GPT-OSS-120b) for the three agents.
- **OpenWeatherMap API** — Current weather conditions for weather-related outage analysis.
- **Tower locations** — Static JSON dataset (`telus_towers.json`) for map display.
- **Web search** — Mock implementation; structured for Google Custom Search, Bing, or SerpAPI.
- **KPI data** — Provided by backend services (simulated or real).

---

## 🧠 Tech Stack

- **Frontend:** React 19, Vite 7, React Router DOM, Leaflet, React-Leaflet, Leaflet.Heat.
- **Backend:** Python 3.12, Flask, Flask-CORS, Gunicorn, aiohttp, python-dotenv.
- **AI/LLMs:** Gemma-3-27b, DeepSeek-v3-2, GPT-OSS-120b (Telus AI Gateway).
- **Infrastructure:** Render (backend), GitHub Pages (frontend via GitHub Actions).

---

## 🧾 License

MIT License — feel free to use and modify with attribution.

---

## 👤 Authors

**Ilian Khankhalaev**  
_BSc Computing Science, Simon Fraser University_  
📍 Vancouver, BC  | [GitHub](https://github.com/florykhan)  |  [LinkedIn](https://www.linkedin.com/in/ilian-khankhalaev/)

**Nikolay Deinego**  
_BSc Computing Science, Simon Fraser University_  
📍 Vancouver, BC  | [GitHub](https://github.com/Deinick)  |  [LinkedIn](https://www.linkedin.com/in/nikolay-deinego/)

**Rohan Nair**  
_BSc Computing Science, University of Toronto_  
📍 Toronto, ON  | [GitHub](https://github.com/rohannair2022)  |  [LinkedIn](https://www.linkedin.com/in/rohansunilkumarnair/)

**Dyk Kyong Do**  
_BSc Computing Science, Simon Fraser University_  
📍 Vancouver, BC  | [GitHub](https://github.com/dykkyongdo)  |  [LinkedIn](https://www.linkedin.com/in/dyk-kyong-do/)

---

## 🙏 Credits

Telus AI Gateway, OpenWeatherMap, Leaflet, React & Vite. Developed for the **AI at the Edge Hackathon** (Telus & Technation).
