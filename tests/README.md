# Tests

Automated tests use Vitest for astronomy, data, UI helper coverage, and deployment configuration. V0.9 includes coverage for GitHub Pages base-path config and app metadata while preserving V0.8 fixture source switching tests.

Recommended validation commands:

- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run verify`
- Manual browser smoke test through the Vite dev server.
- Manual production preview smoke test at `http://127.0.0.1:4173/Solar_System/` after `npm.cmd run build` and `npm.cmd run preview`.
