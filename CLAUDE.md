# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — Production build via `@sveltejs/adapter-static` (output in `build/`)
- `npm run preview` — Serve the production build locally

No test runner, linter, or formatter is configured.
Don't add one unless asked.

## Stack

- **SvelteKit 2** with **Svelte 5 runes** (`$state`, `$effect`, `$props`) — not the legacy `let`/`$:`/`export let` syntax
- **adapter-static** producing a fully prerendered SPA. `src/routes/+layout.js` sets `prerender = true` and `ssr = false` — there is no server runtime, this is a pure client-side app
- Web Audio API and Canvas 2D, no third-party runtime dependencies

## Architecture

This is a single-page app: essentially all behavior lives in `src/routes/+page.svelte`.
The component composes four loosely-coupled subsystems that share top-level reactive state:

1. **Slideshow** — folder of images chosen via `window.showDirectoryPicker()`, converted to object URLs, advanced by a `setInterval` driven by an `$effect`. Object URLs are revoked on folder change and on unmount.
2. **Binaural beats** — two `OscillatorNode`s (one per ear, hard-panned via `StereoPanner`) running at `carrierHz` and `carrierHz + beatHz`, summed through a single gain. `$effect`s push reactive `carrierHz` / `beatHz` / `volume` into the live audio graph without rebuilding it.
3. **Suggestions** — a folder of audio clips decoded once into `AudioBuffer`s. Three independent channels (panned L / C / R) each maintain a shuffled queue and schedule `BufferSourceNode`s with a random inter-clip gap. Channels run on a separate `AudioContext` from the binaural beats so the two can be toggled independently.
4. **Spiral overlay** — `requestAnimationFrame` loop drawing an Archimedean spiral on a full-viewport canvas, rotated by accumulated `dt * spiralSpeed`.

Treat these subsystems as siblings, not layers.
State changes flow one-way: UI controls mutate `$state` variables; `$effect`s reconcile those into Web Audio / DOM side effects. 
When adding a feature, prefer a new `$effect` over imperative event handlers.

## Local file access

All user files (images, audio) come exclusively through the **Web File System Access API** (`showDirectoryPicker`).
Do not propose adding a server, upload endpoint, or `fetch`-based file loading — the project deliberately has no backend.
This works in Chromium-based browsers only; Firefox/Safari are not targets.

## GitHub Pages deployment

`.github/workflows/deploy.yml` builds on push to `main` and deploys via `actions/deploy-pages`.
The workflow sets `BASE_PATH=/${{ github.event.repository.name }}` so `svelte.config.js` configures `kit.paths.base` for the project-page subpath.
Locally `BASE_PATH` is unset and the base is `''`.
`adapter-static` is configured with `fallback: '404.html'` so client-side routes resolve on Pages.

If the repo is renamed or moved to a user/organization page, the `BASE_PATH` line in the workflow needs updating accordingly.
