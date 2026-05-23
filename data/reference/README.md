# Reference Fixtures

This folder contains local reference fixtures for fixture-based comparison reports.

V0.6 fixtures are local demo data only. They are not NASA/JPL Horizons output, SPICE kernels, or precision ephemerides. The first sample fixture was generated from the current bundled J2000 Kepler demo model so the comparison pipeline can be exercised without adding network access or large datasets.

## Format

Each fixture is JSON with:

- `fixtureVersion`
- `sourceLabel`
- `sourceType`
- `accuracyNote`
- `fixtureTimestamp`
- `simulationDate`
- `julianDate`
- `coordinateSystemNote`
- `unitNote`
- `bodyReferences`

Each `bodyReferences` row includes:

- `bodyId`
- `bodyName`
- `expectedX`, `expectedY`, `expectedZ`
- `expectedDistanceFromSun`
- optional `expectedMoonEarthDistance`
- `unit`
- `toleranceMeters`
- `note`

V0.6 supports meter-based rows only. Rows with unsupported units, missing finite coordinates, missing simulated bodies, or invalid values are reported safely as comparison errors.

Future V1 work can replace this local fixture with generated or imported higher-precision reference data while keeping the UI and precision report export layer unchanged.
