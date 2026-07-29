# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Hope Ignites Application Launcher**: a purely static single-page site
(HTML + CSS + vanilla JS + JSON data). There is **no build step, no package manager, and no
backend**. See `README.md` and `CLAUDE.md` for full architecture/feature docs.

### Running the app (development)

There are no dependencies to install. Serve the repo root with any static HTTP server, e.g.:

```bash
python3 -m http.server 5500 --bind 0.0.0.0
```

Then open `http://127.0.0.1:5500/index.html`.

Notes / gotchas:
- SPA routes (`/tech`, `/onboarding`) rely on the CloudFlare `_redirects` rewrite that is not
  applied by `python3 -m http.server`. For local testing use the documented query-param/hash
  fallbacks instead: `?tech=true` / `#tech` and `?onboarding=true` / `#onboarding`.
- The mobile hamburger menu only appears at viewport width ≤ 768px (use DevTools device mode).
- NHQ IP detection calls the external ipify API; without network access it simply treats the
  client as non-NHQ (cards with `nhqOnly: true` are hidden). This is expected, not a bug.
- The service worker (`service-worker.js`) caches core files; if changes don't appear during
  local dev, do a hard refresh or unregister the service worker in DevTools.

### Lint / test / build

There is no lint config, no automated test suite, and no build process. "Testing" means opening
the served site in a browser and exercising features (search, dark mode, favorites, tabs).
`portal-data.json` and `onboarding-data.json` are data files; validate them as JSON after edits
(e.g. `python3 -m json.tool portal-data.json`).
