# V0.7 Reference Import Contract

V0.7 defines a local-only JSON contract for importing reference position data and converting it into the V0.6 fixture comparison format. It is a preparation layer only: it does not call NASA/JPL Horizons, does not read SPICE kernels, and does not claim precision ephemeris validation.

## Dataset Metadata

Required top-level fields:

- `contractVersion`: contract version string, currently `0.7.0`.
- `datasetId`: stable local identifier for the import dataset.
- `sourceName`: human-readable source label.
- `sourceType`: one of `local-demo`, `manual-curated`, `horizons-export`, or `spice-derived`.
- `sourceUrl` or `sourceNote`: source traceability. Local demo files should use `sourceNote`.
- `generatedTimestamp`: timestamp for the source dataset.
- `importedTimestamp`: optional timestamp for local import.
- `accuracyNote`: plain-language accuracy description.
- `licenseNote`: license or usage note for the dataset.
- `coordinateSystem`: supported in V0.7 when `heliocentric-app-j2000` or `heliocentric-ecliptic-j2000`.
- `origin`: expected to be `sun` for fixture conversion.
- `referenceFrame`: reference frame label such as `J2000`.
- `unitSystem`: source unit system label.
- `timeScale`: time scale label such as `UTC`.
- `simulationDate` or `epoch`: ISO-like date associated with the rows.
- `julianDate`: optional finite Julian Date.

## Validation Metadata

`validationMetadata` records the import expectations:

- `expectedCoordinateUnit`: expected coordinate unit, normally `m`.
- `expectedDistanceUnit`: expected distance unit, normally `m`.
- `expectedTimeFormat`: expected time format note.
- `allowedBodyNames`: known body display names.
- `allowedCoordinateSystems`: coordinate systems accepted by this dataset.
- `allowedSourceTypes`: source types accepted by this dataset.

## Body Rows

Rows live in `bodyRows`. Each row should include:

- `bodyId`: stable app body id when available.
- `bodyName`: display name.
- `x`, `y`, `z`: finite heliocentric coordinates.
- `vx`, `vy`, `vz`: optional velocities for future use.
- `distanceFromSun`: optional finite radial distance.
- `moonEarthDistance`: optional finite Moon-Earth distance for Moon rows.
- `unit`: coordinate and distance unit. V0.7 normalizes `AU`, `km`, and `m`.
- `tolerance`: positive finite tolerance in the row unit.
- `confidence`: optional quality label.
- `note`: row note.

## Conversion Behavior

The import pipeline validates metadata and rows before conversion. Accepted rows are normalized to meters and converted into V0.6 `ReferenceFixture` rows, preserving source metadata in the converted fixture. Optional missing velocities do not block conversion.

Unsupported units, invalid coordinates, `NaN`, `Infinity`, `null`, malformed rows, missing required metadata, and unsupported coordinate systems produce import errors. Unknown body names are reported as warnings so manually curated future datasets can be inspected without crashing the app.

## Future V1 Path

Future V1 work can place real exported NASA/JPL Horizons rows, SPICE-derived rows, or curated reference files behind this same contract. The import pipeline can then convert validated local files into the existing fixture comparison and Precision Report UI without changing the UI layer.
