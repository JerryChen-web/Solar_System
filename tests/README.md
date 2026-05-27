# Tests

Automated tests use Vitest for astronomy, data, UI helper coverage, rendering logic helpers, and deployment configuration. V1.0 includes coverage for GitHub Pages base-path config, app metadata, scene modes, focus configs, camera transition math, deterministic small-body belts, and visual scale progression while preserving V0.8 fixture source switching tests.

Recommended validation commands:

- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run verify`
- Manual browser smoke test through the Vite dev server.
- Manual production preview smoke test at `http://127.0.0.1:4173/Solar_System/` after `npm.cmd run build` and `npm.cmd run preview`.

V1.0 smoke checks should include focus entry for Mercury, Earth, and Saturn; `ESC` return; Sun glow; asteroid belt; Saturn rings; labels; Follow / Stop Follow; date jump; validation panels; report exports; reference import; fixture switching; and reset/fallback behavior.
