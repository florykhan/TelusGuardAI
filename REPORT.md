# 📡 TelusGuardAI — Network Impact Analyzer — Full Report

This document is the **full project report** for TelusGuardAI: an AI-powered network impact analysis system. For a quick overview and run instructions, see the main [README.md](README.md).

---

## 🎯 Project Overview

The goal of this project is to:

- **Automate network impact analysis** by processing natural language queries about service disruptions.
- **Aggregate multi-source intelligence** from web searches, weather data, and real-time information.
- **Generate geospatial impact assessments** with affected areas, severity levels, and confidence scores.
- **Provide actionable insights** for network operations and **visualize** coverage and impact on an interactive map.

The system addresses **rapid, data-driven network outage analysis** during weather events, infrastructure failures, and other disruptions, using multiple AI agents in coordination.

**Target users:** Network Operations Center (NOC) engineers, telecommunications providers, emergency response teams, and technical reviewers.

---

## ✨ Key Features

- **Multi-Agent AI orchestration** — Three specialized agents: query parsing, web/weather intelligence, geospatial reasoning.
- **Natural language queries** — e.g. “What areas were affected by the ice storm in Toronto?”
- **Web search & weather** — Parallel web searches and OpenWeatherMap integration.
- **Geospatial reasoning** — LLM-derived affected areas with coordinates, severity, and confidence.
- **Interactive map** — React + Leaflet: towers, impact zones, heatmaps.
- **Real-time KPIs** — Network metrics (traffic, latency, packet loss) per tower.
- **Caching** — 5-minute TTL to reduce API cost and improve performance.
- **Confidence & severity** — Per-area confidence (0–1) and severity (critical / high / moderate / low).

---

## 🧱 Repository Structure

Exact folder layout (`.github/`, `backend/`, `frontend/`, and all subfolders):

```
TelusGuardAI/
│
├── .github/                                 # GitHub configuration
│   └── workflows/
│       └── deploy-pages.yml                 # GitHub Actions: frontend deployment to GitHub Pages
│
├── backend/                                 # Flask backend and multi-agent system
│   ├── agents/                              # AI agent implementations
│   │   ├── __init__.py
│   │   ├── event_intelligence.py            # Agent 1: query parsing, metadata and search queries
│   │   ├── web_intelligence.py              # Agent 2: web search and weather aggregation
│   │   └── geospatial_reasoning.py          # Agent 3: geographic impact analysis
│   ├── models/                              # Data models and schemas
│   │   ├── __init__.py
│   │   └── data_models.py                   # Event, AffectedArea, AnalysisResult models
│   ├── services/                            # External service integrations
│   │   ├── __init__.py
│   │   ├── ai_client.py                     # Unified client for AI model endpoints
│   │   ├── web_search.py                    # Web search service (mock; ready for real API)
│   │   ├── weather_api.py                   # OpenWeatherMap API integration
│   │   ├── kpi_service.py                   # Network KPI data service
│   │   ├── kpi_stream.py                    # KPI streaming
│   │   ├── tower_loader.py                  # Tower data loading utilities
│   │   ├── tower_kpi_generator.py           # Tower KPI generation
│   │   ├── zenodo_loader.py                 # Zenodo time-series data loader
│   │   └── incident_engine.py               # Incident logic
│   ├── utils/                               # Utility modules
│   │   ├── __init__.py
│   │   ├── cache.py                         # In-memory caching with TTL
│   │   └── logger.py                        # Structured logging utilities
│   ├── scripts/                             # Backend scripts (e.g. data prep)
│   ├── app.py                               # Flask application entry point
│   ├── orchestrator.py                      # Main orchestration workflow
│   ├── config.py                            # Configuration and environment variables
│   └── requirements.txt                     # Python dependencies
│
├── frontend/                                # React frontend application
│   ├── public/                              # Static assets served by the app
│   ├── src/                                 # Application source code
│   │   ├── components/                      # React components
│   │   │   ├── CoverageMap.jsx              # Interactive Leaflet map component
│   │   │   ├── EventPanel.jsx               # Query input and analysis trigger
│   │   │   ├── DetailsPanel.jsx             # Tower details and KPI display
│   │   │   ├── ImpactAreaReport.jsx         # Affected area analysis report
│   │   │   ├── SafetyPanel.jsx              # Network safety metrics
│   │   │   ├── ResultsCard.jsx              # Analysis results card
│   │   │   ├── InputCard.jsx                # Query input card
│   │   │   ├── Header.jsx                   # App header
│   │   │   ├── StatusBanner.jsx             # Connection/status banner
│   │   │   ├── EmptySelectionPanel.jsx      # Placeholder when nothing selected
│   │   │   ├── ActionLog.jsx                # Action log component
│   │   │   └── ...
│   │   ├── pages/                           # Page components
│   │   │   ├── DashboardPage.jsx            # Main dashboard layout
│   │   │   └── CoverageMapPage.jsx          # Map-focused view
│   │   ├── data/                            # Static data files
│   │   │   └── telus_towers.json            # Tower location data
│   │   ├── assets/                          # Images and assets
│   │   ├── lib/                             # Frontend utility libraries
│   │   ├── App.jsx                          # Main application component
│   │   └── main.jsx                         # Application entry point
│   ├── .env.example                         # Environment variable template (VITE_BACKEND_URL)
│   ├── package.json                         # Node.js dependencies
│   ├── vite.config.js                       # Vite build configuration
│   └── convert_csv_to_json.py               # Script to convert CSV to JSON (e.g. towers)
│
├── Procfile                                 # Render backend deployment configuration
├── .gitignore
├── README.md                                # Main overview and quick start
└── REPORT.md                                # This file — full project report
```

---

## 🤖 How the AI Agents Work

### Agent 1: Event Intelligence Agent  
**Model:** Gemma-3-27b (Telus AI Gateway)

- **Role:** Interprets the user question and extracts structured metadata.
- **Input:** Natural language query (e.g. “What areas were affected by the ice storm in Toronto?”).
- **Output:** Event type, location, timeframe, 3–5 optimized web search queries, and a flag for whether weather data is needed.
- **Parameters:** Temperature 0.3, max tokens 1000 (focused, deterministic).

### Agent 2: Web Intelligence Agent  
**Model:** DeepSeek-v3-2 (Telus AI Gateway)

- **Role:** Gathers and aggregates data from the web and weather.
- **Input:** Search queries from Agent 1.
- **Actions:** Runs web searches in parallel (mock implementation; ready for Google/Bing/SerpAPI), optionally fetches OpenWeatherMap data, deduplicates results.
- **Output:** Consolidated intelligence payload for Agent 3.
- **Parameters:** Temperature 0.5, max tokens 1500.

### Agent 3: Geospatial Reasoning Agent  
**Model:** GPT-OSS-120b (Telus AI Gateway)

- **Role:** Analyzes intelligence and produces geographic impact.
- **Input:** Aggregated web + weather data.
- **Output:** Affected areas with lat/long, radius, severity (critical/high/moderate/low), confidence (0–1), and reasoning.
- **Parameters:** Temperature 0.4, max tokens 3000 (analytical).

**Data flow:** User query → Event Intelligence → Web Intelligence → Geospatial Reasoning → Orchestrator → Cache → Frontend map.

---

## 📊 Datasets & APIs Used

### Datasets

- **Tower locations:** Static JSON (`frontend/src/data/telus_towers.json`) used for map display and context.
- **Zenodo-style time series:** Backend can load Zenodo-style `r1.txt` (time, value) via `zenodo_loader.py` for time-series data where used.
- **KPI data:** Provided by backend services (`kpi_service`, `tower_kpi_generator`, `kpi_stream`) — can be simulated or wired to real sources.

### APIs & External Services

- **Telus AI Gateway** (paas.ai.telus.com) — LLM endpoints for Gemma-3-27b, DeepSeek-v3-2, GPT-OSS-120b (and optionally Qwen3Coder-30b, Qwen-Embedding).
- **OpenWeatherMap API** — Current weather conditions for weather-related outage analysis (`weather_api.py`, key via `OPENWEATHER_API_KEY`).
- **Web search** — Mock in `web_search.py`; structured for drop-in replacement with Google Custom Search, Bing, or SerpAPI.

---

## 🏗️ System Architecture

- **Frontend:** React + Vite SPA, Leaflet/React-Leaflet for maps, React Router. Polls backend for analysis and KPIs.
- **Backend:** Flask REST API, Gunicorn in production. Orchestrator runs the three agents in sequence; in-memory cache (5 min TTL).
- **AI layer:** Three agents as above; `ai_client.py` abstracts model calls and timeouts.

---

## 🧰 Tech Stack (Summary)

- **Frontend:** React 19.x, Vite 7.x (Rolldown), React Router DOM, Leaflet, React-Leaflet, Leaflet.Heat.
- **Backend:** Python 3.12, Flask, Flask-CORS, Gunicorn, aiohttp, python-dotenv, asyncio.
- **AI/LLMs:** Gemma-3-27b, DeepSeek-v3-2, GPT-OSS-120b via Telus AI Gateway.
- **Infrastructure:** Render (backend), GitHub Pages (frontend via `.github/workflows/deploy-pages.yml`).

---

## 🚀 Deployment

- **Backend (Render):** `Procfile` runs Gunicorn (`backend.app:app`) with 1 worker, 4 threads, 180s timeout. Build: `pip install -r backend/requirements.txt`.
- **Frontend (GitHub Pages):** Workflow builds with `VITE_BACKEND_URL` set to the Render backend URL and deploys `frontend/dist/`.

---

## 🔐 Environment Variables

**Backend:** `PORT` (optional, default 5001), `OPENWEATHER_API_KEY` (optional), `FLASK_DEBUG` (optional). AI tokens are in `config.py` (hackathon); for production they should be env vars.

**Frontend:** `VITE_BACKEND_URL` — backend base URL. Default for local dev: `http://localhost:5000`. For production, set before `npm run build` (e.g. to Render URL).

---

## 📋 API Endpoints (Summary)

- `GET /`, `GET /health` — Service info and health.
- `POST /api/analyze-network-impact` — Main analysis; body: `{ "question": "string", "options": { "max_areas", "min_confidence" } }`.
- `POST /api/kpis` — KPIs for tower IDs; body: `{ "tower_ids": [...], "options": { "mode": "sim" } }`.
- `GET /api/cache-stats`, `GET /api/cached-queries`, `POST /api/clear-cache` — Cache management.
- `GET /api/docs` — API documentation.

CORS allows GitHub Pages origin and `localhost:5173` / `127.0.0.1:5173`.

---

## 🧾 Frontend-Specific Details (from original frontend README)

- **Environment:** Copy `.env.example` to `.env` in `frontend/` and set `VITE_BACKEND_URL` for production or leave unset for `http://localhost:5000`.
- **Commands:** `npm install`, `npm run dev` (http://localhost:5173), `npm run build`, `npm run preview`. Deploy `dist/` to GitHub Pages (see `.github/workflows/deploy-pages.yml`).
- **Error handling:** Network errors show user-friendly messages; KPI fetch failures are non-blocking; analysis errors are shown in the UI with actionable info.
- **Dependencies:** React 18+, Vite, Leaflet, React-Leaflet, React Router DOM (see `package.json`).

---

## ⚠️ Known Limitations

- Web search is mocked; integrate a real search API for production.
- Geocoding uses a hardcoded city dictionary; consider Google Geocoding or Nominatim.
- Single Gunicorn worker to avoid async issues; limits concurrency.
- No authentication or rate limiting on the API.
- Cache is in-memory (lost on restart); consider Redis for production.
- Tower data is static JSON; no real-time tower status in this version.

---

## 🚀 Future Improvements

Real web search API, geocoding service, historical weather, real-time tower status, multi-worker support, persistent cache (e.g. Redis), authentication & rate limiting, retries and fallbacks, social/mobile data sources, ML-based impact prediction, WebSocket for live KPIs, export (PDF/CSV), alerts for critical areas.

---

## 📄 License & Authors

MIT License. Authors: Ilian Khankhalaev, Nikolay Deinego, Rohan Nair, Dyk Kyong Do (see [README.md](README.md)).

---

**Credits:** Telus AI Gateway, OpenWeatherMap, Leaflet, React & Vite. Developed for the AI at the Edge Hackathon.
