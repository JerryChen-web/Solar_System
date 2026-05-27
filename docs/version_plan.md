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

## V0.3 - Completed Astronomy Accuracy And Orbit Validation

Completed:

- Robust Kepler solver with convergence metadata and input guards.
- Julian Date conversion and Debug panel display.
- `YYYY-MM-DD` date jump control.
- Improved approximate Moon model.
- Orbit validation helpers for finite checks, radius bounds, and continuity.
- Expanded astronomy-focused Vitest coverage.

## V0.4 - Validation Dashboard And Reference Comparison

Completed:

- Lightweight Validation Dashboard.
- Local approximate reference range comparison.
- Sun reference-body validation.
- Position Table with current x/y/z and distance values.
- Moon-Earth distance check.
- Debug panel validation summary counts.
- Cached/throttled validation UI rendering.
- Continuity history reset on date jump.

Known limits:

- V0.4 reference comparison is local approximate validation, not NASA/JPL Horizons precision comparison.
- Validation checks numerical sanity and broad orbital ranges, not high-precision ephemeris accuracy.
- Moon-Earth range is approximate and intended for future replacement.

## V0.5 - Reference Adapter And Validation Report Export

Completed:

- Reference adapter interface for future higher-precision validation providers.
- Local approximate reference provider using existing V0.4 sanity ranges.
- Validation report generation from the current validation summary.
- JSON export for stable readable validation reports.
- CSV export for practical per-body validation rows.
- Lightweight Validation Report panel near the existing validation UI.

Known limits:

- V0.5 still uses local approximate sanity checking, not NASA/JPL Horizons precision data.
- The adapter is a preparation layer for later ephemeris providers and does not add SPICE or external datasets.
- Exported reports reflect the current local validation state, not scientific-grade external validation.

## V0.6 - Reference Fixture Comparison And Precision Report

Completed:

- Local reference fixture format and sample fixture.
- Fixture parser with safe handling for missing metadata, malformed rows, unit mismatches, and invalid values.
- Position comparison engine for fixture rows.
- Precision metrics for per-body dx/dy/dz, 3D delta, radial delta, percentage error, and Moon-Earth distance delta.
- Lightweight Precision Report panel with JSON and CSV export.
- Documentation for local fixture comparison and future reference-source replacement.

Known limits:

- V0.6 uses local fixture-based comparison, not live NASA/JPL Horizons or SPICE precision validation.
- The sample fixture is generated from the current local demo model and is not an external authority.
- Future V1 can replace fixture contents with real reference data while keeping the UI and report export layer stable.

## V0.7 - Completed Real Reference Data Contract And Import Pipeline

Completed:

- Local reference data contract for future real reference datasets.
- Source metadata, coordinate system, source type, unit, tolerance, and body row validation.
- Dependency-free AU, km, and m normalization helpers.
- Local import pipeline that converts accepted rows into the V0.6 fixture format.
- Import diagnostics and Reference Import panel.
- Sample local import dataset and import contract documentation.

Known limits:

- V0.7 is local-only and does not fetch live NASA/JPL Horizons data.
- V0.7 does not add SPICE kernels, SPICE parsing, or large external datasets.
- Converted sample data is still demo data from the bundled local model, not an external precision authority.
- Future V1 can feed real exported reference files through the contract while preserving the Precision Report UI and export layer.

## V0.8 - Completed Fixture Source Switching

Completed:

- Local fixture source manager for default, sample import, local import, and fallback-default states.
- App starts on the bundled V0.6 default fixture.
- Converted V0.7 sample import fixture can be activated from the Reference Import panel.
- User-selected local JSON import can be converted through the existing V0.7 pipeline.
- Active fixture/source indicator is visible in the main controls.
- Safe fallback to default fixture for malformed JSON, blocked conversion, fatal converted fixture errors, or zero converted rows.
- Precision Report uses the currently active fixture source.
- Validation Dashboard, Validation Report exports, Precision Report exports, and Reference Import report behavior are preserved.
- Browser title and visible version label are updated to V0.8.0 through central app metadata.

Known limits:

- V0.8 remains local-only and offline-only.
- V0.8 does not add live NASA/JPL Horizons fetching, SPICE kernels, backend services, databases, deployment, or large datasets.
- Local import files must match the V0.7 JSON contract to convert into fixture rows.
- GitHub Pages preparation remains future work.

## V0.9 - Completed GitHub Pages Preparation

Completed:

- Vite production build base path prepared for `/Solar_System/`.
- Local dev remains served from the root path at `127.0.0.1`.
- GitHub Pages deployment workflow scaffold added for pushes to `main`.
- Empty `public/.nojekyll` added for direct Vite asset serving.
- Deployment guide and V1.0 public release checklist added.
- Version metadata updated to V0.9.0.
- V0.8 fixture source switching and offline-only behavior preserved.

Known limits:

- V0.9 prepares deployment but is not the first public stable release.
- GitHub repository Pages settings may still need to be set to GitHub Actions.
- V0.9 does not add live NASA/JPL Horizons fetching, SPICE, N-body activation, backend services, databases, UI rewrites, or large datasets.

## V1.0.0 - Completed Public Stable Visual Release

Completed:

- First public stable visual release on the V0.9 GitHub Pages foundation.
- Deep procedural rendering pass with stronger Sun glow, tuned planet materials, improved orbit readability, and deeper starfield.
- Layered Saturn rings and subtle Uranus ring cue.
- Deterministic asteroid belt between Mars and Jupiter.
- Sparse procedural Kuiper belt beyond Neptune.
- Planet ecosystem focus mode for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.
- Click-to-enter focus mode and `ESC` / button return to overview.
- V1.0.0 browser title and visible app label.
- Existing selection, Follow / Stop Follow state, time controls, validation panels, report exports, reference import, fixture switching, and fallback reset preserved.

Known limits:

- V1.0.0 visual improvements are procedural display enhancements, not new physical datasets.
- V1.0.0 does not add live NASA/JPL Horizons fetching, SPICE, backend services, databases, spacecraft, live small-body catalogs, or large texture packs.

## V1.1 - Kepler Model Precision Improvement

Next phase:

- Better orbital validation against real local reference imports prepared through the V0.7 contract.
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
