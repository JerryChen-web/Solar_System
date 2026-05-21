# AGENTS.md

## Project Name
Solar_System

## Project Goal
Build a web-based Solar System visualization and physics simulation model using public NASA/JPL/IAU/USGS data sources, clean modular architecture, and a future roadmap toward an OpenSpace-like system.

## Current Workspace
C:\AI\Codex\Solar_System

## Safety and Permission Rules
- Only create, edit, or delete files inside this workspace.
- Do not modify files outside C:\AI\Codex\Solar_System.
- Do not delete existing user files unless explicitly requested.
- Ask before running commands that require network access.
- Ask before installing large dependencies.
- Do not download large textures, SPICE kernels, or external datasets during the MVP phase.

## Tech Stack
- Frontend: Vite + TypeScript + Three.js
- Data tools: Python 3.11+
- Data format: JSON, CSV, Markdown
- Units: SI units for all physical calculations

## Data Rules
- Real physical data and visual display data must be separated.
- Real distances, radii, masses, and velocities must not be overwritten by visual scaling.
- All real physical data should use SI units:
  - meter
  - kilogram
  - second
  - radian
- Raw data goes in `data/raw`.
- Cleaned app-ready data goes in `data/processed`.
- Schemas go in `data/schema`.
- All data sources must be documented in `data/processed/source_registry.json` and `docs/data_sources.md`.

## Physics Rules
- Kepler orbit mode and N-body physics mode must be separate.
- Kepler mode uses orbital elements.
- N-body mode uses mass, position, velocity, and gravitational acceleration.
- Use `G = 6.67430e-11 m^3 kg^-1 s^-2`.
- Use `AU = 149597870700 m`.
- Do not use arbitrary animation speed as physical velocity.
- Time scaling should affect simulation time, not physical constants.

## Rendering Rules
- Use visual radius and visual distance scaling only for display.
- MVP should use placeholder colors or lightweight placeholder textures.
- Add orbit lines.
- Add labels.
- Add camera controls.
- Add basic sunlight.
- Keep performance stable.

## MVP Scope
V0.1 must include:
- Sun
- Mercury
- Venus
- Earth
- Moon
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Orbit lines
- Kepler orbit animation
- Time speed control
- Basic UI panel
- Placeholder N-body engine architecture

## Future Scope
V5 should evolve toward an OpenSpace-like system:
- Mission trajectories
- Asteroids
- Comets
- Spacecraft
- SPICE/Horizons data pipeline
- Dataset layer management
- Timeline system
- Multi-scale visualization
- Observer mode
- Scientific validation tools

## Development Rules
- Keep modules small and readable.
- Avoid magic numbers.
- Centralize constants in `src/config/constants.ts`.
- Every feature must keep `npm run dev` working.
- Prefer simple, stable MVP first.
- Do not over-engineer before V0.1 is working.

