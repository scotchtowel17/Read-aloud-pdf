# Read Aloud PDF

Tap a PDF to hear it read out loud. Works fully offline.

A small installable **Progressive Web App**. After the first load — and once a
voice has been fetched — everything runs locally in the browser with no network.

## Features

- **Tap to listen** — open a PDF, tap anywhere on a page, and it reads from that
  spot, highlighting each line. Tap elsewhere to jump.
- **Two voices** — an instant system voice, or a natural on-device neural voice
  (kokoro-js / onnxruntime from jsDelivr, models from Hugging Face) that runs
  entirely in the browser.
- **Offline-first** — the app shell (including PDF.js) is precached by a service
  worker; the neural engine and downloaded voices are cached so each voice
  crosses the network only once, and the model survives app updates.
- **Reading controls** — play / pause / stop, previous / next sentence, a speed
  slider, a live reading-progress bar, and keyboard shortcuts (Space, ← / →).
- **Picks up where you left off** — speed, voice, theme, and per-document
  reading position are remembered across sessions.
- **Light / dark theme** — follows the system setting with a manual toggle.
- **Accessible** — ARIA-labelled controls, a screen-reader live region that
  announces reading state, and full keyboard operation.
- **Fast on big documents** — pages rasterize on demand as they scroll into
  view, so a large PDF opens near-instantly and stays light on memory. PDF.js
  runs in a Web Worker (off the main thread) with a main-thread fallback.
- **Installable** — standalone PWA with maskable icons, an iOS home-screen icon,
  and install screenshots.
- **Private** — everything runs on your device; nothing is uploaded.

## Project layout

| File | Purpose |
| --- | --- |
| `index.html` | The app UI and logic (~37 KB). |
| `pdf.min.js`, `pdf.worker.min.js` | Vendored PDF.js, loaded from `index.html` and precached for offline use. Kept as separate files so the browser can cache/compile them across loads instead of re-parsing a multi-MB inline script every visit. |
| `sw.js` | Offline service worker (app-shell + runtime engine/voice caches). |
| `manifest.webmanifest` | PWA manifest (name, icons, theme, categories, install screenshots). |
| `_headers` | Sets `COOP: same-origin` + `COEP: require-corp` so the WASM engine can use `SharedArrayBuffer` (cross-origin isolation). |
| `netlify.toml` | Netlify build/headers config (static site, no build step). |
| `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png` | App icons. |
| `screenshot-wide.png`, `screenshot-narrow.png` | Manifest install screenshots. |

## Deploying

The `_headers` file targets static hosts that honor it (Netlify, Cloudflare
Pages). Cross-origin isolation is **required** for the neural engine — the two
COOP/COEP headers must be served on the app's HTML.

## Status

Complete and battle-tested. The app is verified end-to-end in a headless browser
across 150 automated checks covering the text pipeline, playback, offline
operation, accessibility, theming, persistence, reading controls, and on-demand
rendering.
