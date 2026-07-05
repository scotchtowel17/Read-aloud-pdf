# Read Aloud PDF

Tap a PDF to hear it read out loud. Works fully offline.

A small installable **Progressive Web App**. After the first load — and once a
voice has been fetched — everything runs locally in the browser with no network.

## Features

- **Offline-first** — app shell is precached by a service worker; the neural
  voice engine and downloaded voices are cached so each voice crosses the
  network only once.
- **Installable** — standalone PWA with maskable icons and an iOS home-screen
  icon.
- **On-device speech** — uses the kokoro-js / onnxruntime neural voice engine
  loaded from jsDelivr, with voice models from Hugging Face.

## Project layout

| File | Purpose |
| --- | --- |
| `index.html` | The app UI and logic. |
| `sw.js` | Offline service worker (app-shell + runtime engine/voice caches). |
| `manifest.webmanifest` | PWA manifest (name, icons, theme). |
| `_headers` | Sets `COOP: same-origin` + `COEP: require-corp` so the WASM engine can use `SharedArrayBuffer` (cross-origin isolation). |
| `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png` | App icons. |

## Deploying

The `_headers` file targets static hosts that honor it (Netlify, Cloudflare
Pages). Cross-origin isolation is **required** for the neural engine — the two
COOP/COEP headers must be served on the app's HTML.

## Status

Complete — `index.html`, the service worker, manifest, headers, and icons are
all in place.
