# Solar_System

Solar_System is a Vite + TypeScript + Three.js Solar System visualization MVP. It uses local demo data, a Kepler orbit model, and a modular rendering/UI structure that can grow toward more scientific data pipelines later.

V0.2 improves the V0.1 MVP with clearer interaction, stronger visual feedback, richer body data, and basic tests. It still does not call NASA APIs, download textures, use SPICE, or include large datasets.

## Requirements

- Node.js 20+
- npm

On Windows PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.

## Development Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test
```

Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

## V0.2 Features

- Follow camera for the selected body.
- Selected body highlight with an auto-scaled glow/ring.
- Time scale presets:
  - Pause
  - 1 hour/s
  - 1 day/s
  - 10 days/s
  - 30 days/s
  - 1 year/s
- Enhanced body info panel grouped by Basic, Physical, Orbit, and Visual fields.
- Debug panel with mode, simulation date, time scale, selected/follow body, body/orbit counts, camera target, and renderer stats.
- Basic Vitest coverage for Kepler math, demo data, orbital elements, and visual config.

## How To Use

- Select a body by clicking it in the 3D view.
- Press `Follow` to make the camera target smoothly follow the selected body.
- Press `Stop Follow` to return to free camera targeting.
- Use the time slider for custom speed, or choose a preset from the preset dropdown.
- Use `Pause` / `Play` to stop or resume simulation time without changing the selected time scale.
- Use `Reset` to return the simulation date to the configured epoch.
- Open or collapse the `Debug` section in the right panel to inspect runtime state.

## V0.1 Foundation

- Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, and Neptune.
- Kepler orbit mode using approximate J2000 orbital elements.
- Simplified Moon orbit around Earth.
- Orbit lines and labels.
- Basic orbit camera controls.
- Body selection and information panel.
- Physical data stays in SI units; visual scaling is applied only at render time.
- N-body placeholder modules are present for later phases.

## Current Limits

- NASA/JPL Horizons is not connected yet.
- Full N-body propagation is not active yet.
- Large textures are not used.
- The app still uses local demo data and Kepler mode as the primary simulation path.
- No React, Next.js, Tailwind, Docker, database, SPICE, asteroids, comets, spacecraft, or deployment pipeline is included.

## Data Layout

- `data/processed`: app-ready demo JSON.
- `data/raw`: reserved for future source archives.
- `data/schema`: JSON schemas for processed data.
- `docs`: design notes and version plan.
- `tools`: future data pipeline notes.
- `tests`: Vitest test coverage.

