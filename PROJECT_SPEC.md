# Solar_System Project Specification

## 1. Project Vision
Solar_System is a high-quality web-based Solar System physical visualization model. It combines public astronomy data, orbital mechanics, N-body physics architecture, and 3D visualization.

The long-term goal is to evolve from a simple MVP into an OpenSpace-like educational and scientific visualization platform.

## 2. Development Philosophy
The project follows this principle:

Real physical model != visual display model.

All physical values must remain scientifically meaningful. Visual scaling is only used when rendering objects to screen.

## 3. Core Modes

### 3.1 Kepler Orbit Mode
Uses J2000 orbital elements to compute approximate planetary positions.

Use this mode for smooth MVP animation, educational display, and stable orbit visualization.

### 3.2 N-body Physics Mode
Uses mass, position, velocity, and gravitational acceleration.

Use this mode later for physics simulation, mutual gravity, state vector propagation, and validation against JPL Horizons.

### 3.3 Future Ephemeris Mode
Uses NASA/JPL Horizons or SPICE kernels.

Use this mode later for high precision planetary positions, mission trajectories, spacecraft paths, asteroids, and comets.

## 4. MVP Bodies
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

## 5. Data Source Priority

### S Tier
- NASA/JPL Horizons
- JPL Planetary Physical Parameters
- NASA Planetary Fact Sheets
- IAU WGCCRE
- USGS Astrogeology

### A Tier
- OpenSpace
- Celestia
- Stellarium
- Skyfield
- poliastro

## 6. Version Plan

### V0: Static Display
Display Sun + 8 planets + Moon with scaled distances and radii.

### V1: Kepler Orbit Model
Animate planets using orbital elements.

### V2: N-body Physics Model
Add physical simulation architecture.

### V3: NASA/JPL Data Pipeline
Fetch and convert authoritative astronomical data.

### V4: Visual Precision
Improve realism with optional textures, atmosphere placeholders, and better lighting.

### V5: OpenSpace-like System
Build a dataset-driven space visualization platform.

## 7. Acceptance Criteria for V0.1
- `npm install` succeeds.
- `npm run dev` succeeds.
- Browser displays Sun + planets + Moon.
- Orbit lines are visible.
- Planets move in Kepler mode.
- Time scale can be changed.
- User can select a body and see basic info.
- Code is modular.
- `source_registry.json` exists.
- README explains how to run the project.

## 8. Non-goals for V0.1
- No NASA live API.
- No SPICE kernels.
- No large textures.
- No asteroids.
- No spacecraft.
- No React.
- No database.
- No Docker.

