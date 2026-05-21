# NASA/JPL Pipeline

The pipeline is deferred to V3. V0.1 does not fetch from NASA/JPL and does not require network access.

Future scripts should:

- Accept target, center, start time, stop time, and step size.
- Store raw Horizons responses in `data/raw/jpl_horizons`.
- Convert validated outputs to `data/processed/state_vectors.json` or updated orbital element files.
- Update `data/processed/source_registry.json` with provenance metadata.

