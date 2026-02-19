# TelusGuardAI - Network Impact Analyzer

An **AI-powered network impact analysis system** that detects and analyzes service disruptions during events using a multi-agent orchestration framework. The system processes natural language queries about network outages, gathers intelligence from web sources and weather APIs, and generates geospatial impact assessments with affected areas, severity levels, and confidence scores.

---

## 🎯 Project Overview

The goal of this project is to:
- **Automate network impact analysis** by processing natural language queries about service disruptions
- **Aggregate multi-source intelligence** from web searches, weather data, and real-time information
- **Generate geospatial impact assessments** identifying affected areas with precise coordinates, severity levels, and confidence metrics
- **Provide actionable insights** for network operations teams to prioritize response efforts
- **Visualize network coverage and impact zones** on an interactive map interface

This system addresses the critical need for **rapid, data-driven network outage analysis** during weather events, infrastructure failures, and other service disruptions. By leveraging multiple AI agents working in coordination, the system can process complex queries, gather relevant data, and produce structured geographic impact reports faster than manual analysis.

**Target Users / Stakeholders:**
- Network Operations Center (NOC) engineers and analysts
- Telecommunications service providers monitoring network health
- Emergency response teams coordinating during natural disasters
- Technical reviewers and recruiters evaluating AI/ML system design

---

## ✨ Key Features

- **Multi-Agent AI Orchestration**: Three specialized AI agents work in sequence to parse queries, gather intelligence, and analyze geographic impact
- **Natural Language Query Processing**: Accepts questions like "What areas were affected by the ice storm in Toronto?" and extracts structured event metadata
- **Intelligent Web Search**: Executes parallel web searches to gather outage reports, news articles, and social media mentions
- **Weather Data Integration**: Fetches current weather conditions from OpenWeatherMap API when analyzing weather-related outages
- **Geospatial Reasoning**: Uses large language models to analyze data and identify affected geographic areas with precise coordinates
- **Interactive Map Visualization**: React-based frontend with Leaflet maps showing tower locations, impact zones, and heatmaps
- **Real-time KPI Monitoring**: Fetches and displays network performance metrics (traffic, latency, packet loss) for individual towers
- **Caching System**: Results are cached for 5 minutes to improve performance and reduce API costs
- **Confidence Scoring**: Each affected area includes a confidence score (0-1) based on data quality and source reliability
- **Severity Assessment**: Areas are classified as critical, high, moderate, or low severity based on evidence strength

---

## 🧱 Repository Structure

```
ai-at-the-edge-hackathon/
│
├── backend/                              # Flask backend with multi-agent system
│   ├── agents/                           # AI agent implementations
│   │   ├── event_intelligence.py         # Agent 1: Parses queries, extracts metadata
│   │   ├── web_intelligence.py           # Agent 2: Gathers web & weather data
│   │   └── geospatial_reasoning.py       # Agent 3: Analyzes geographic impact
│   ├── services/                         # External service integrations
│   │   ├── ai_client.py                  # Unified client for AI model endpoints
│   │   ├── web_search.py                 # Web search service (mock implementation)
│   │   ├── weather_api.py                # OpenWeatherMap API integration
│   │   ├── kpi_service.py                # Network KPI data service
│   │   └── tower_loader.py               # Tower data loading utilities
│   ├── models/                           # Data models and schemas
│   │   └── data_models.py                # Event, AffectedArea, AnalysisResult models
│   ├── utils/                            # Utility modules
│   │   ├── cache.py                      # In-memory caching with TTL
│   │   └── logger.py                     # Structured logging utilities
│   ├── app.py                            # Flask application entry point
│   ├── orchestrator.py                   # Main orchestration workflow
│   ├── config.py                         # Configuration and environment variables
│   └── requirements.txt                  # Python dependencies
│
├── frontend/                             # React frontend application
│   ├── src/
│   │   ├── components/                   # React components
│   │   │   ├── CoverageMap.jsx           # Interactive Leaflet map component
│   │   │   ├── EventPanel.jsx            # Query input and analysis trigger
│   │   │   ├── DetailsPanel.jsx         # Tower details and KPI display
│   │   │   ├── ImpactAreaReport.jsx      # Affected area analysis report
│   │   │   └── SafetyPanel.jsx          # Network safety metrics
│   │   ├── pages/                        # Page components
│   │   │   ├── DashboardPage.jsx        # Main dashboard layout
│   │   │   └── CoverageMapPage.jsx       # Map-focused view
│   │   ├── data/                         # Static data files
│   │   │   └── telus_towers.json         # Tower location data
│   │   ├── lib/                          # Utility libraries
│   │   └── App.jsx                       # Main application component
│   ├── package.json                      # Node.js dependencies
│   ├── vite.config.js                   # Vite build configuration
│   └── .env.example                     # Environment variable template
│
├── .github/
│   └── workflows/
│       └── deploy-pages.yml              # GitHub Actions workflow for frontend deployment
│
├── Procfile                             # Render deployment configuration
├── .gitignore
└── README.md
```

---

## 🏗️ System Architecture

The system follows a **three-tier architecture** with clear separation between frontend, backend, and AI services:

### Frontend Layer
- **React + Vite**: Modern single-page application with component-based architecture
- **Leaflet Maps**: Interactive geographic visualization with custom markers, heatmaps, and zone overlays
- **Real-time Updates**: Polls backend API for KPI data and displays analysis results

### Backend Layer
- **Flask REST API**: Asynchronous request handling with Gunicorn for production
- **Multi-Agent Orchestrator**: Coordinates three specialized AI agents in a sequential workflow
- **Caching Layer**: In-memory cache with 5-minute TTL to reduce redundant API calls
- **Service Abstraction**: Modular services for web search, weather data, and KPI retrieval

### AI Agent Layer
The system uses three specialized agents that process queries through distinct stages:

1. **Event Intelligence Agent** (Gemma-3-27b)
   - Parses natural language queries to extract structured metadata
   - Identifies event types (weather, infrastructure, power outages, etc.)
   - Generates optimized search queries for web intelligence gathering
   - Determines geographic scope and whether weather data is needed

2. **Web Intelligence Agent** (DeepSeek-v3-2)
   - Executes parallel web searches using queries from Agent 1
   - Fetches weather data from OpenWeatherMap API when applicable
   - Deduplicates search results and aggregates intelligence
   - Prepares consolidated data for geospatial analysis

3. **Geospatial Reasoning Agent** (GPT-OSS-120b)
   - Analyzes aggregated intelligence to identify affected geographic areas
   - Generates precise coordinates (latitude/longitude) and impact radii
   - Assigns severity levels (critical, high, moderate, low) based on evidence
   - Calculates confidence scores and provides detailed reasoning
   - Structures output as Event objects with AffectedArea arrays

### Data Flow

```
User Query (Natural Language)
    ↓
[Event Intelligence Agent] → Extracts metadata, generates search queries
    ↓
[Web Intelligence Agent] → Gathers web results + weather data (parallel)
    ↓
[Geospatial Reasoning Agent] → Analyzes data, identifies affected areas
    ↓
[Orchestrator] → Filters, formats, generates summary
    ↓
[Cache] → Stores result for 5 minutes
    ↓
[Frontend] → Visualizes on interactive map
```

---

## 🧰 Tech Stack

### Frontend
- **React 19.2.0**: Component-based UI framework
- **Vite 7.2.5** (Rolldown): Fast build tool and dev server
- **React Router DOM 7.13.0**: Client-side routing
- **Leaflet 1.9.4**: Interactive map library
- **React Leaflet 5.0.0**: React bindings for Leaflet
- **Leaflet.Heat 0.2.0**: Heatmap visualization plugin
- **JavaScript/ES6+**: Modern JavaScript with async/await

### Backend
- **Python 3.12**: Core language
- **Flask 3.0.0**: Web framework for REST API
- **Flask-CORS 4.0.0**: Cross-origin resource sharing
- **Gunicorn 21.2.0**: Production WSGI server
- **aiohttp 3.9.1**: Asynchronous HTTP client for AI model calls
- **python-dotenv 1.0.0**: Environment variable management
- **asyncio**: Native async/await support for concurrent operations

### AI / LLMs
- **Gemma-3-27b**: Event Intelligence Agent (query parsing)
  - Endpoint: Telus AI Gateway (paas.ai.telus.com)
  - Temperature: 0.3 (focused, deterministic)
  - Max tokens: 1000

- **DeepSeek-v3-2**: Web Intelligence Agent (data aggregation)
  - Endpoint: Telus AI Gateway
  - Temperature: 0.5 (balanced creativity)
  - Max tokens: 1500

- **GPT-OSS-120b**: Geospatial Reasoning Agent (impact analysis)
  - Endpoint: Telus AI Gateway
  - Temperature: 0.4 (analytical, precise)
  - Max tokens: 3000

- **Qwen3Coder-30b**: Available for code generation tasks (not currently used in main workflow)
- **Qwen-Embedding**: Available for semantic embeddings (not currently used)

### Infrastructure
- **Render**: Backend hosting (Python/Flask service)
  - Workers: 1 (to avoid async code issues)
  - Threads: 4 per worker
  - Timeout: 180 seconds (for long AI model calls)
  
- **GitHub Pages**: Frontend hosting (static site deployment)
  - Automated deployment via GitHub Actions
  - Builds on push to main branch

### APIs & External Services
- **OpenWeatherMap API**: Current weather conditions and forecasts
- **Telus AI Gateway**: Unified endpoint for multiple LLM models (Gemma, DeepSeek, GPT, Qwen)
- **Web Search**: Mock implementation (ready for Google Custom Search, Bing, SerpAPI integration)

---

## 🤖 How the AI Agents Work

### Agent 1: Event Intelligence Agent
**Model**: Gemma-3-27b  
**Role**: Query understanding and metadata extraction

This agent acts as the "interpreter" of the system. It receives a natural language question (e.g., "What areas were affected by the ice storm in Toronto?") and extracts structured information:

- **Event Type**: Classifies the disruption (weather_related_outage, infrastructure_outage, power_outage, etc.)
- **Location**: Identifies geographic references (city, region, province)
- **Timeframe**: Extracts temporal information (yesterday, January 23, last week)
- **Search Queries**: Generates 3-5 optimized web search queries tailored for finding network outage information
- **Weather Flag**: Determines if weather data is needed based on event type

The agent uses a carefully crafted system prompt that enforces JSON output format and guides the model to generate effective search queries that include variations with "network outage", "cellular service", carrier names, and temporal terms.

### Agent 2: Web Intelligence Agent
**Model**: DeepSeek-v3-2  
**Role**: Data aggregation from multiple sources

This agent is the "researcher" of the system. It takes the search queries from Agent 1 and executes them in parallel, then aggregates the results:

- **Parallel Web Searches**: Executes all search queries concurrently using asyncio for optimal performance
- **Result Deduplication**: Removes duplicate URLs to ensure unique data points
- **Weather Data Fetching**: If flagged by Agent 1, fetches current weather conditions from OpenWeatherMap API
- **Data Consolidation**: Combines web results and weather data into a single IntelligenceData object

The agent is designed to be extensible—currently using mock search results, but structured to integrate with real search APIs (Google Custom Search, Bing, SerpAPI) with minimal changes.

### Agent 3: Geospatial Reasoning Agent
**Model**: GPT-OSS-120b  
**Role**: Geographic impact analysis and area identification

This agent is the "analyst" of the system. It receives all gathered intelligence and performs sophisticated reasoning to identify affected areas:

- **Evidence Analysis**: Reviews web search results and weather data to identify mentions of service disruptions
- **Geographic Mapping**: Determines precise coordinates (latitude/longitude) for affected neighborhoods or districts
- **Severity Assessment**: Classifies each area as critical, high, moderate, or low based on:
  - Number of independent sources mentioning the area
  - Presence of official confirmations
  - Correlation with weather data
  - Strength of evidence
- **Confidence Scoring**: Calculates confidence scores (0-1) based on data quality and source reliability
- **Impact Estimation**: Provides estimates of affected users and detailed reasoning citing specific evidence

The agent outputs structured JSON with Event objects containing arrays of AffectedArea objects, each with coordinates, severity, confidence, and detailed reasoning.

---

## 🚀 Deployment Setup

### Backend Deployment (Render)

The backend is deployed on **Render** as a Python/Flask web service.

**Configuration:**
- **Root Directory**: Project root (where `Procfile` is located)
- **Start Command**: 
  ```bash
  gunicorn backend.app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 180 --graceful-timeout 180 --keep-alive 5
  ```
- **Environment**: Python 3.12
- **Build Command**: `pip install -r backend/requirements.txt`

**Important Settings:**
- `--workers 1`: Single worker to avoid memory issues with async code
- `--threads 4`: Multiple threads per worker for concurrent requests
- `--timeout 180`: Extended timeout to allow long AI model calls to complete
- `--graceful-timeout 180`: Grace period for workers to finish before force-kill
- `--keep-alive 5`: Keep connections alive for 5 seconds

The `Procfile` in the project root contains these settings and is automatically used by Render if no custom Start Command is set.

### Frontend Deployment (GitHub Pages)

The frontend is deployed on **GitHub Pages** using GitHub Actions.

**Workflow** (`.github/workflows/deploy-pages.yml`):
- Triggers on push to `main` branch
- Builds React app with production backend URL
- Deploys `frontend/dist/` to GitHub Pages

**Configuration:**
- Build environment variable: `VITE_BACKEND_URL=https://telusguardai-backend.onrender.com`
- Output directory: `frontend/dist/`
- GitHub Pages source: `gh-pages` branch (managed by Actions)

---

## 🔐 Environment Variables

### Backend Environment Variables

**Required:**
- `PORT` (optional, default: `5001`) - Port for Flask server to bind to (Render sets this automatically)

**Optional:**
- `OPENWEATHER_API_KEY` (optional, default: provided) - OpenWeatherMap API key for weather data
- `FLASK_DEBUG` (optional, default: `False`) - Set to `"true"` to enable Flask debug mode

**AI Model Tokens** (hardcoded in `config.py` for this hackathon):
- `GEMMA_TOKEN` - Authentication token for Gemma endpoint
- `DEEPSEEK_TOKEN` - Authentication token for DeepSeek endpoint
- `GPT_TOKEN` - Authentication token for GPT endpoint
- `QWEN_CODER_TOKEN` - Authentication token for Qwen Coder endpoint
- `QWEN_EMB_TOKEN` - Authentication token for Qwen Embedding endpoint

> ⚠️ **Note**: In production, these tokens should be stored as environment variables and loaded via `os.getenv()`.

### Frontend Environment Variables

**Optional:**
- `VITE_BACKEND_URL` - Backend API base URL
  - If not set, defaults to `http://localhost:5000` for local development
  - For production, set to deployed backend URL (e.g., `https://telusguardai-backend.onrender.com`)

Create a `.env` file in the `frontend/` directory:
```bash
VITE_BACKEND_URL=https://your-backend-url.com
```

---

## 🧾 Run Locally

### Prerequisites
- **Python 3.12+** (backend)
- **Node.js 20+** and npm (frontend)
- **Git** for cloning the repository

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/florykhan/ai-at-the-edge-hackathon.git
   cd ai-at-the-edge-hackathon
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate      # macOS/Linux
   venv\Scripts\activate         # Windows
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set environment variables** (optional)
   ```bash
   export PORT=5001
   export OPENWEATHER_API_KEY=your_api_key_here
   export FLASK_DEBUG=False
   ```

6. **Run the Flask server**
   ```bash
   python app.py
   ```

   The server will start on `http://0.0.0.0:5001` (or the port specified by `PORT` env var).

   For production-like testing with Gunicorn:
   ```bash
   gunicorn app:app --bind 0.0.0.0:5001 --workers 1 --threads 4 --timeout 180 --graceful-timeout 180 --keep-alive 5
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional, for custom backend URL)
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_BACKEND_URL if needed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or the port shown in terminal).

5. **Build for production** (optional)
   ```bash
   npm run build
   ```

   The `dist/` folder can be deployed to any static hosting service.

### Testing the System

1. **Start backend** (in one terminal):
   ```bash
   cd backend
   python app.py
   ```

2. **Start frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open browser** to `http://localhost:5173`

4. **Test analysis** by entering a query like:
   - "What areas were affected by the ice storm in Toronto?"
   - "Show me network outages in Vancouver yesterday"
   - "Which regions experienced service disruptions during the power outage?"

---

## ⚠️ Known Limitations / Trade-offs

- **Web Search is Mocked**: The web search service currently returns mock data. Integration with real search APIs (Google Custom Search, Bing, SerpAPI) is required for production use.

- **Geocoding is Hardcoded**: Location name to coordinate conversion uses a hardcoded dictionary of Canadian cities. A proper geocoding service (Google Geocoding API, OpenStreetMap Nominatim) should be integrated.

- **Single Worker Architecture**: Backend uses a single Gunicorn worker to avoid async code issues. This limits concurrent request handling but ensures stability with asyncio operations.

- **No Authentication**: The API currently has no authentication or rate limiting. Production deployments should add API keys, OAuth, or similar security measures.

- **Limited Error Recovery**: If an AI model call times out or fails, the system falls back to basic metadata generation but may produce lower-quality results.

- **Cache is In-Memory**: The caching system uses Python dictionaries and is lost on server restart. For production, consider Redis or similar persistent cache.

- **Weather Data Scope**: Weather API integration is limited to current conditions. Historical weather data and forecasts are not currently utilized.

- **Tower Data is Static**: Tower locations are loaded from a static JSON file. Real-time tower status and dynamic loading are not implemented.

---

## 🚀 Future Improvements

- **Real Web Search Integration**: Replace mock web search with Google Custom Search API, Bing Search API, or SerpAPI for actual data gathering.

- **Advanced Geocoding**: Integrate Google Geocoding API or OpenStreetMap Nominatim for accurate location-to-coordinate conversion.

- **Historical Weather Data**: Incorporate historical weather data and forecasts to improve correlation with past outages.

- **Real-time Tower Status**: Connect to live tower monitoring APIs to display current network health and capacity.

- **Multi-Worker Support**: Refactor async code to support multiple Gunicorn workers for better scalability.

- **Persistent Caching**: Migrate from in-memory cache to Redis for distributed caching and persistence across restarts.

- **Authentication & Rate Limiting**: Add API key authentication and rate limiting to protect backend resources.

- **Enhanced Error Handling**: Implement retry logic with exponential backoff and more sophisticated fallback strategies.

- **Social Media Integration**: Add Twitter/X API and Reddit API integration for real-time outage reports from users.

- **Machine Learning Models**: Train custom models to predict network impact based on historical data and weather patterns.

- **Real-time Streaming**: Implement WebSocket support for real-time KPI updates and live analysis progress.

- **Multi-language Support**: Extend query processing to support multiple languages beyond English.

- **Export Functionality**: Add PDF/CSV export for analysis reports and affected area data.

- **Alert System**: Implement notification system for critical severity areas and automated monitoring.

---

## 📊 API Endpoints

### Main Endpoints

- `GET /` - Service information and available endpoints
- `GET /health` - Health check endpoint
- `POST /api/analyze-network-impact` - Main analysis endpoint
  - Request body: `{ "question": "string", "options": { "max_areas": 10, "min_confidence": 0.7 } }`
  - Response: Analysis result with events and affected areas
- `POST /api/kpis` - Get KPIs for tower IDs
  - Request body: `{ "tower_ids": ["tower_1", "tower_2"], "options": { "mode": "sim" } }`
- `GET /api/cache-stats` - Cache statistics
- `GET /api/cached-queries` - List cached queries
- `POST /api/clear-cache` - Clear all cached results
- `GET /api/docs` - API documentation

### CORS Configuration

The backend allows requests from:
- `https://florykhan.github.io` (GitHub Pages production)
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173` (Vite dev server alternative)

---

## 📄 License

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

- **Telus AI Gateway**: Provided access to multiple LLM models (Gemma, DeepSeek, GPT, Qwen) for the hackathon
- **OpenWeatherMap**: Weather data API for correlation with network outages
- **Leaflet**: Open-source mapping library for interactive geographic visualization
- **React & Vite**: Modern frontend framework and build tooling

---

> 🗒️ **Note:**  
> This project was developed for the **AI at the Edge Hackathon** and demonstrates a production-quality multi-agent AI system for network impact analysis. The architecture is designed to be extensible, with clear separation of concerns and modular components that can be enhanced with real API integrations and additional data sources.
