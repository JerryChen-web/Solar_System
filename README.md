# Solar_System

Solar_System is a Vite + TypeScript + Three.js Solar System visualization MVP. It uses local demo data, a Kepler orbit model, and a modular rendering/UI structure that can grow toward higher-precision astronomy data pipelines later.

V0.7 adds a local reference data contract and import pipeline on top of V0.6. It can validate and normalize local demo, manually curated, future Horizons-export, or future SPICE-derived JSON files into the existing fixture comparison format, but it still does not call NASA APIs, download textures, use SPICE, or include large datasets.

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

## V0.7 Features

- Formal local reference import contract for future real reference datasets.
- Import validation for dataset/source metadata, coordinate system, source type, body rows, units, tolerances, and invalid numeric values.
- Dependency-free unit normalization for AU, km, and m.
- Conversion from accepted import rows into the V0.6 fixture comparison format.
- Structured import reports with dataset/source metadata, accepted rows, warnings, errors, row diagnostics, and converted fixture status.
- Compact Reference Import panel showing sample dataset status and confirming no live external connection.
- Sample local import dataset under `data/reference/sample_import_v0_7.json`.
- Contract documentation under `data/reference/import_contract_v0_7.md`.

## V0.6 Features Preserved

- Local reference fixture format under `data/reference`.
- Sample J2000 demo fixture generated from the current local Kepler/Moon model.
- Fixture parser with safe handling for missing metadata, malformed rows, unit mismatches, unknown bodies, and invalid values.
- Fixture comparison metrics: dx/dy/dz, 3D position delta, radial distance delta, percentage error, Moon-Earth distance delta, and PASS/WARN/ERROR status.
- Precision Report panel with fixture/source summary and JSON/CSV export controls.
- Structured precision reports with fixture metadata, totals, aggregate deltas, and per-body comparison rows.
- Vitest coverage for fixture parsing, comparison, report serialization, and panel helpers.

## V0.5 Features Preserved

- Reference adapter interface for future higher-precision providers without rewriting the UI.
- Local approximate reference provider using the existing V0.4 distance sanity ranges.
- Validation Report panel with JSON and CSV export controls.
- Structured validation reports with app version, simulation date, Julian Date, generated timestamp, totals, per-body rows, position rows, and Moon-Earth distance check.
- Safe export fallbacks for missing, `NaN`, or `Infinity` values.
- Vitest coverage for reference lookup, report serialization, CSV export, and report panel helpers.

## V0.4 Features Preserved

- Validation Dashboard with PASS/WARN/ERROR status for Sun, planets, and Moon.
- Sun special validation as the reference body near origin.
- Position Table with x/y/z in AU, distance from Sun, and validation status.
- Moon-Earth distance check with local approximate range validation.
- Debug panel validation summary counts: checked, pass, warning, and error.
- Continuity history handling with safe reset on date jump.
- Cached/throttled dashboard and table rendering to keep animation smooth.
- Vitest coverage for validation summaries, Moon-Earth distance, Sun reference behavior, continuity reset, and table formatting.

## V0.3 Features Preserved

- Robust Kepler equation solver with convergence handling.
- Julian Date utilities and Debug panel Julian Date display.
- `YYYY-MM-DD` date input for jumping simulation time to a specific UTC date.
- Improved approximate Moon model using Earth-relative lunar orbital elements.
- Pure orbit validation helpers for finite checks, radius bounds, and continuity.

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
- Open the `Debug`, `Validation Dashboard`, `Validation Report`, `Precision Report`, `Reference Import`, and `Position Table` sections in the right panel to inspect validation state, import status, and export reports.

## Current Accuracy Limits

- V0.7 import is local contract validation and fixture conversion only; it is not live NASA/JPL Horizons or SPICE validation.
- V0.6 precision comparison remains local fixture-based comparison, not NASA/JPL Horizons precision comparison.
- The reference adapter is a preparation layer for future higher-precision sources, not a precision data source by itself.
- The sample import dataset and sample precision fixture are local demo data generated from the current model, not external scientific references.
- Planet distance ranges are based on local orbital elements and sanity tolerances.
- The Moon-Earth distance check uses a local approximate range, not a high-precision lunar ephemeris.
- Planet positions are suitable for visualization and structural validation, not high-precision scientific measurement.
- NASA/JPL Horizons, SPICE kernels, state-vector propagation, and full N-body simulation remain future phases.

## Current Technical Limits

- NASA/JPL Horizons is not connected yet.
- The import pipeline does not fetch external data; it only processes bundled or future local JSON files.
- Full N-body propagation is not active yet.
- Large textures are not used.
- The app still uses local demo data and Kepler mode as the primary simulation path.
- No React, Next.js, Tailwind, Docker, database, SPICE, asteroids, comets, spacecraft, or deployment pipeline is included.

## Data Layout

- `data/processed`: app-ready demo JSON.
- `data/reference`: local fixture samples, V0.7 import sample, and format/contract notes.
- `data/raw`: reserved for future source archives.
- `data/schema`: JSON schemas for processed data.
- `docs`: design notes and version plan.
- `tools`: future data pipeline notes.
- `tests`: Vitest test coverage.
