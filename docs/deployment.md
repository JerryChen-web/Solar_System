# GitHub Pages Deployment

V1.0.0 preserves the V0.9 static GitHub Pages deployment foundation.

Expected public URL:

`https://JerryChen-web.github.io/Solar_System/`

Production base path:

`/Solar_System/`

## Local Checks

```powershell
npm.cmd run dev
npm.cmd run test
npm.cmd run build
npm.cmd run preview
```

Local development normally loads at:

`http://127.0.0.1:5173/`

After `npm.cmd run build` and `npm.cmd run preview`, production preview should be checked at:

`http://127.0.0.1:4173/Solar_System/`

Confirm the app loads, the canvas and labels render, the visible version is current, and the Reference Import, Precision Report, Validation Dashboard, Validation Report, and Position Table panels still work.

## Workflow

Workflow path:

`.github/workflows/deploy-pages.yml`

The workflow runs on pushes to `main` and manual `workflow_dispatch`. It installs dependencies with `npm ci`, runs tests, builds the Vite app, uploads `dist`, and deploys with official GitHub Pages actions.

## GitHub Settings

In GitHub repository Settings > Pages, Source may need to be set to GitHub Actions before deployment publishes.

## Limits

This is static deployment only. V1.0.0 does not add a backend, API service, database, SPICE integration, NASA/JPL live data, external runtime fetches, or large datasets.
