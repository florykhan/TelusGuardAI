# TelusGuardAI - Network Impact Analyzer

AI-powered network impact analysis system for detecting and analyzing service disruptions during events.

## Architecture

- **Frontend**: React + Vite, deployed on GitHub Pages
- **Backend**: Flask (Python), multi-agent orchestration system

## Backend Deployment

### Requirements

- Python 3.8+
- All dependencies in `backend/requirements.txt`

### Environment Variables

The backend requires the following environment variables:

#### Required

- `PORT` (optional, default: `5001`) - Port for the Flask server to bind to
- `OPENWEATHER_API_KEY` (optional, default: provided) - OpenWeatherMap API key for weather data

#### Optional

- `FLASK_DEBUG` (optional, default: `False`) - Set to `"true"` to enable Flask debug mode

### Running Locally

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The server will start on `http://0.0.0.0:5001` (or the port specified by `PORT` env var).

### Production Deployment with Gunicorn

Use extended timeouts so AI agent requests (Gemma, DeepSeek, GPT) can complete before workers are killed:

```bash
cd backend
pip install -r requirements.txt
gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 180 --graceful-timeout 180 --keep-alive 5
```

Or if `PORT` is not set:
```bash
gunicorn app:app --bind 0.0.0.0:5001 --workers 4 --timeout 180 --graceful-timeout 180 --keep-alive 5
```

### Render Start Command

If deploying to [Render](https://render.com), set the **Start Command** to:

```
cd backend && pip install -r requirements.txt && gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 180 --graceful-timeout 180 --keep-alive 5
```

Or, if dependencies are installed in the build step:

```
cd backend && gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 180 --graceful-timeout 180 --keep-alive 5
```

Render sets `PORT` automatically. The project root includes a `Procfile` that uses the same gunicorn settings; Render will use it if no custom Start Command is set.

### API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/analyze-network-impact` - Main analysis endpoint
- `POST /api/kpis` - Get KPIs for tower IDs
- `GET /api/cache-stats` - Cache statistics
- `GET /api/cached-queries` - List cached queries
- `POST /api/clear-cache` - Clear cache
- `GET /api/docs` - API documentation

### CORS Configuration

The backend is configured to allow requests from:
- `https://florykhan.github.io` (GitHub Pages production)
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173` (Vite dev server alternative)

## Frontend Deployment

### Environment Variables

Create a `.env` file (or set in your hosting platform):

```bash
VITE_API_BASE_URL=https://your-backend-url.com
```

If not set, defaults to `http://127.0.0.1:5001` for local development.

### Local Development

```bash
cd frontend
npm install
npm run dev
```

### Building for Production

```bash
cd frontend
npm run build
```

The `dist/` folder can be deployed to GitHub Pages or any static hosting.

## Project Structure

```
.
├── backend/          # Flask backend with multi-agent system
│   ├── agents/       # AI agents (event intelligence, geospatial, web)
│   ├── services/     # Services (KPI, weather, web search)
│   ├── models/       # Data models
│   ├── utils/        # Utilities (cache, logger)
│   ├── app.py        # Flask application entry point
│   └── config.py     # Configuration
├── frontend/         # React frontend
│   └── src/
│       ├── components/  # React components
│       ├── pages/      # Page components
│       └── data/       # Static data files
└── README.md
```

## License

MIT
