# Data Sources

V0.8 uses local demo data and local user-selected import files only. No network calls are made by the app.

Primary future sources are tracked in `data/processed/source_registry.json`:

- NASA/JPL Horizons for orbital elements and state vectors.
- JPL Planetary Physical Parameters for mass, radius, density, and GM.
- NASA/NSSDCA fact sheets for planet reference values.
- IAU WGCCRE for body orientation and coordinate systems.
- USGS Astrogeology for future map products.

OpenSpace, Celestia, and Stellarium are architecture references only. Their code and assets must not be copied into this project without a separate license review.

V0.8 fixture source switching does not add live NASA/JPL Horizons fetching, SPICE integration, external APIs, backend services, deployment, or large datasets.

V0.9 adds GitHub Pages deployment preparation only. It does not add new runtime data sources, live network fetching, SPICE kernels, backend services, databases, or large datasets.
