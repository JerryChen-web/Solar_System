# Solar_System

Solar_System is a Vite + TypeScript + Three.js Solar System visualization MVP. It uses local demo data, a Kepler orbit model, and a modular rendering/UI structure that can grow toward higher-precision astronomy data pipelines later.

V0.3 focuses on astronomy accuracy and orbit validation while preserving all V0.2 interaction features. It still does not call NASA APIs, download textures, use SPICE, or include large datasets.

## Requirements

- Node.js 20+
- npm

On Windows PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.

## Development Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
npm.cmd audit --audit-level=moderate
```

Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

## V0.3 Features

- More robust Kepler equation solver with tolerance, iteration limit, near-circular handling, convergence metadata, and invalid-input guards.
- Julian Date utilities and Debug panel Julian Date display.
- `YYYY-MM-DD` date input for jumping simulation time to a specific UTC date.
- Improved approximate Moon model using Earth-relative lunar orbital elements, then composing with Earth's heliocentric position.
- Pure orbit validation helpers for finite checks, perihelion/aphelion radius bounds, and continuity checks.
- Expanded Vitest coverage for Kepler convergence, Julian Date conversion, orbital element conversion, Moon model validation, and orbit validation.

## V0.2 Features Preserved

- Follow camera for the selected body.
- Selected body highlight with an auto-scaled glow/ring.
- Time scale presets.
- Enhanced body info panel grouped by Basic, Physical, Orbit, and Visual fields.
- Debug panel with runtime state and renderer stats.

## How To Use

- Select a body by clicking it in the 3D view.
- Press `Follow` to make the camera target smoothly follow the selected body.
- Press `Stop Follow` to return to free camera targeting.
- Use the time slider for custom speed, or choose a preset from the preset dropdown.
- Enter a date as `YYYY-MM-DD` and press `Jump` to move the simulation to that UTC date.
- Invalid date input shows a message and leaves the simulation date unchanged.
- Use `Pause` / `Play` to stop or resume simulation time without changing the selected time scale.
- Use `Reset` to return the simulation date to the configured J2000 epoch.
- Open or collapse the `Debug` section in the right panel to inspect simulation date, Julian Date, camera target, and renderer state.

## Current Accuracy Limits

- V0.3 uses local approximate orbital elements and lightweight Kepler propagation.
- The Moon model is improved over V0.2 but is still approximate and not a NASA/JPL ephemeris.
- Planet positions are suitable for visualization and structural validation, not high-precision scientific measurement.
- NASA/JPL Horizons, SPICE kernels, state-vector propagation, and full N-body simulation remain future phases.

## Current Technical Limits

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

