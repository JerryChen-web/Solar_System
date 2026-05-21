# Solar_System

Solar_System is a Vite + TypeScript + Three.js MVP for a data-driven Solar System visualization and physics model.

V0.1 focuses on a clean runnable foundation: demo data, Kepler orbit animation, visible orbit paths, labels, camera controls, time scale controls, and a placeholder N-body architecture. It does not call NASA APIs, download textures, use SPICE, or include large datasets.

## Requirements

- Node.js 20+
- npm

On Windows PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.

## Run

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

## Build

```powershell
npm.cmd run typecheck
npm.cmd run build
```

## V0.1 Features

- Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, and Neptune.
- Kepler orbit mode using approximate J2000 orbital elements.
- Simplified Moon orbit around Earth.
- Orbit lines and labels.
- Basic orbit camera controls.
- Time multiplier, pause/play, reset, and simulation date display.
- Body selection and basic body information panel.
- Physical data stays in SI units; visual scaling is applied only at render time.
- N-body placeholder modules are present for later phases.

## Data Layout

- `data/processed`: app-ready demo JSON.
- `data/raw`: reserved for future source archives.
- `data/schema`: JSON schemas for processed data.
- `docs`: design notes and version plan.
- `tools`: future data pipeline notes.

