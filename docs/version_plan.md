# Version Plan

## V0.1 - Completed MVP

Completed:

- Basic Vite + TypeScript + Three.js MVP.
- Sun + 8 planets + Moon.
- Kepler mode from local demo orbital elements.
- Orbit lines.
- Labels.
- Basic UI and body selection.
- Physical data separated from visual scale.

## V0.2 - Completed Visual And Interaction Improvements

Completed:

- Follow camera.
- Selected body highlight.
- Time scale presets.
- Enhanced body info panel.
- Visual / physics debug panel.
- Basic Vitest tests.

## V0.3 - Astronomy Accuracy And Orbit Validation

Current phase:

- Robust Kepler solver with convergence metadata and input guards.
- Julian Date conversion and Debug panel display.
- `YYYY-MM-DD` date jump control.
- Improved approximate Moon model.
- Orbit validation helpers for finite checks, radius bounds, and continuity.
- Expanded astronomy-focused Vitest coverage.

Known limits:

- Uses local approximate orbital elements, not NASA/JPL Horizons.
- Moon model is visualization-grade and intended for future replacement.
- Validation checks numerical sanity and broad orbital ranges, not high-precision ephemeris accuracy.

## V1 - Kepler Model Precision Improvement

Next phase:

- Better orbital validation against external reference data.
- More accurate Moon model.
- Optional richer date/time input.
- More precise simulation date controls.
- Kepler output comparison reports.

## V2 - N-body Demo Activation

Future phase:

- N-body demo activation.
- State vector propagation.
- Energy check.
- Kepler / N-body comparison tools.

## V3 - NASA/JPL Data Pipeline

Future phase:

- NASA/JPL Horizons data pipeline.
- Raw source archive.
- Processed state vector output.
- Source registry updates.
- Validation reports.

## V4 - Visual Precision Layer

Future phase:

- Optional texture loader.
- Improved rings and atmosphere placeholders.
- Better sunlight and shadow behavior.
- Camera follow refinements.

## V5 - OpenSpace-like Dataset System

Future phase:

- Dataset layer manager.
- Mission trajectories.
- Small body catalogs.
- Spacecraft objects.
- Timeline manager.
- Observer mode.
- Multi-scale navigation.
- Data provenance panel.

