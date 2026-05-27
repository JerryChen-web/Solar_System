# V1.0 Public Release Checklist

Use this checklist after V0.9.0 is verified and before treating GitHub Pages as the first stable public website release.

- Confirm `main` is clean and tagged through `v0.9.0`.
- Confirm GitHub Pages Source is set to GitHub Actions.
- Run `npm.cmd run test`.
- Run `npm.cmd run typecheck`.
- Run `npm.cmd run build`.
- Run `npm.cmd audit --audit-level=moderate`.
- Run a local dev smoke test at `http://127.0.0.1:5173/`.
- Run a production preview smoke test at `http://127.0.0.1:4173/Solar_System/`.
- Confirm the deployed URL loads at `https://JerryChen-web.github.io/Solar_System/`.
- Confirm browser title and visible app version match the release.
- Confirm canvas, labels, body selection, Follow / Stop Follow, time presets, date jump, Debug panel, Validation Dashboard, Position Table, Moon-Earth check, Validation Report exports, Precision Report exports, Reference Import panel, fixture source switching, and reset to default.
- Confirm there are no console errors in local dev, production preview, or the public deployed page.
- Confirm `_codex_prompts` remains untouched.
- Confirm docs still state that NASA/JPL Horizons, SPICE, backend services, databases, live external fetches, and large datasets are future work.
