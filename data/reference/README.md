# Reference Fixtures

This folder contains local reference fixtures and local import contract samples for fixture-based comparison reports.

V0.6 fixtures are local demo data only. They are not NASA/JPL Horizons output, SPICE kernels, or precision ephemerides. The first sample fixture was generated from the current bundled J2000 Kepler demo model so the comparison pipeline can be exercised without adding network access or large datasets.

V0.7 adds `sample_import_v0_7.json` and `import_contract_v0_7.md`. The import sample uses the same local demo intent, then validates and converts through the import pipeline into the V0.6 fixture shape. This proves the future data path without adding live NASA/JPL Horizons integration, SPICE, or large datasets.

V0.8 adds app-level source switching for these local fixtures. The default source remains `sample_fixture_v0_6.json`; `sample_import_v0_7.json` can be converted and activated through the UI; user-selected local JSON files can be tested against the V0.7 contract without network access. If conversion is blocked, the app falls back to the default fixture.

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

## Import Contract

The V0.7 import contract accepts local JSON files with source metadata, coordinate metadata, validation metadata, and body rows. It supports `AU`, `km`, and `m` normalization, reports row-level warnings/errors, and converts accepted rows into meter-based fixture rows. See `import_contract_v0_7.md` for the full contract.

V0.8 uses the same contract for local file selection. Rows with fatal errors are excluded from converted fixtures. Warning rows can be activated only when the import pipeline can safely normalize them.
