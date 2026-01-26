# TelusGuardAI Frontend

React + Vite frontend for the Network Impact Analyzer, deployed on GitHub Pages.

## Environment Configuration

### Setting Backend URL

Create a `.env` file in the `frontend/` directory (or copy from `.env.example`):

```bash
# For local development (default)
# Leave unset or use: http://127.0.0.1:5001

# For production (GitHub Pages)
VITE_API_BASE_URL=https://your-backend-url.com
```

The frontend will automatically use `import.meta.env.VITE_API_BASE_URL` if set, otherwise defaults to `http://127.0.0.1:5001` for local development.

**Note**: For GitHub Pages deployment, you must set `VITE_API_BASE_URL` to your deployed backend URL. This is done at build time, so set it before running `npm run build`.

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev
```

The dev server will proxy API calls to the backend URL specified in your `.env` file (or default to `http://127.0.0.1:5001`).

## Building for Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The `dist/` folder contains the production build that can be deployed to GitHub Pages or any static hosting service.

## Deployment to GitHub Pages

1. Set `VITE_API_BASE_URL` in your environment or `.env` file to your deployed backend URL
2. Build the project: `npm run build`
3. Deploy the `dist/` folder to GitHub Pages (via GitHub Actions or manual upload)

See `.github/workflows/deploy-pages.yml` for automated deployment.

## Error Handling

The frontend gracefully handles backend connection failures:

- **Network errors**: Shows user-friendly error messages when the backend is unreachable
- **KPI fetch failures**: Silently fails (non-critical, doesn't disrupt UI)
- **Analysis errors**: Displays error messages in the UI with actionable information

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── CoverageMap.jsx
│   │   ├── EventPanel.jsx
│   │   ├── DetailsPanel.jsx
│   │   └── ...
│   ├── pages/         # Page components
│   │   ├── DashboardPage.jsx
│   │   └── CoverageMapPage.jsx
│   ├── data/          # Static data files
│   │   └── telus_towers.json
│   └── App.jsx        # Main app component
├── public/            # Static assets
├── .env.example       # Environment variable template
└── vite.config.js    # Vite configuration
```

## Dependencies

- React 18+
- Vite
- Leaflet & React-Leaflet (maps)
- React Router DOM

See `package.json` for complete dependency list.
