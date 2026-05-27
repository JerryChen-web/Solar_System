# Data Sources

V1.0 uses local demo data, local user-selected import files, and procedural runtime visual generation only. No network calls are made by the app.

Primary future sources are tracked in `data/processed/source_registry.json`:

- NASA/JPL Horizons for orbital elements and state vectors.
- JPL Planetary Physical Parameters for mass, radius, density, and GM.
- NASA/NSSDCA fact sheets for planet reference values.
- IAU WGCCRE for body orientation and coordinate systems.
- USGS Astrogeology for future map products.

OpenSpace, Celestia, and Stellarium are architecture references only. Their code and assets must not be copied into this project without a separate license review.

V0.8 fixture source switching does not add live NASA/JPL Horizons fetching, SPICE integration, external APIs, backend services, deployment, or large datasets.

V0.9 adds GitHub Pages deployment preparation only. It does not add new runtime data sources, live network fetching, SPICE kernels, backend services, databases, or large datasets.

V1.0 adds procedural display systems only:

- Runtime canvas textures for planet color bands, cloud cues, crater cues, and storm markers.
- Runtime Three.js glow shells, atmosphere shells, ring bands, starfield points, asteroid belt points, and Kuiper belt points.
- Deterministic seeded distributions for small-body belts and starfield layers.

These are visual approximations for public-demo readability. They are not new physical datasets and do not replace the SI physical body data, orbital elements, validation fixtures, or future NASA/JPL/IAU/USGS source pipeline.
