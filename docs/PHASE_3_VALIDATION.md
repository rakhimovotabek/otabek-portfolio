# Phase 3 validation

Verified 2026-10-11 on local Linux, Node 26.11.1 / npm 12.2.0. Existing Chromium was driven through Playwright installed outside the application. FFmpeg was downloaded only into Playwright's tool cache for the recording. No application dependencies changed.

## Build checks

- `npm run typecheck`: passed.
- `npm run lint`: passed, including the reusable browser-check scripts.
- `npm run build`: passed with static homepage, not-found and icon routes.
- Production preview returned HTTP 200 on `http://127.0.0.1:3001`.
- `git diff --check`: passed.

## Browser checks

| Viewport | Behavior | Evidence |
| --- | --- | --- |
| 1440 × 1000 | Desktop exhibition | [Hero](preview/phase3/desktop-hero.png), [SAT’chi](preview/phase3/desktop-vault-1.png), [Huquq Test](preview/phase3/desktop-vault-2.png), [SME](preview/phase3/desktop-vault-3.png), [Downloader](preview/phase3/desktop-vault-4.png), [IELTS](preview/phase3/desktop-vault-5.png) |
| 1366 × 900 | Desktop exhibition | [Hero](preview/phase3/laptop-hero.png), [Side Quests](preview/phase3/laptop-quests.png), [Contact](preview/phase3/laptop-contact.png) |
| 390 × 844 | Natural-scroll mobile | [Hero](preview/phase3/mobile-hero.png), [About](preview/phase3/mobile-about.png), [Side Quests](preview/phase3/mobile-quests.png), [Contact](preview/phase3/mobile-contact.png) |
| 360 × 800 | Natural-scroll narrow mobile | [Hero](preview/phase3/narrow-mobile-hero.png), [Side Quests](preview/phase3/narrow-mobile-quests.png), [Dialog](preview/phase3/narrow-mobile-dialog.png) |

At both desktop sizes, all five reading holds reached visible final states. Slow handoffs, fast skipping and reverse scrolling passed with no blank combined-panel state, horizontal overflow or browser runtime exceptions. Four covered panels were inert/aria-hidden, with one interactive scene. Project anchors selected the correct chapter. Focus moved safely when a focused project left. Opening notes exited pinning, restored all project access and preserved summary focus.

At both phone sizes, all five projects remained in natural flow, forward/reverse scrolling passed, mobile navigation closed after anchor selection, and the Vault was never pinned. Direct CDP touch events scrolled forward and backward; the forward swipe moved 485px. Landscape 844 × 390 retained natural scrolling without overflow. Initial hero reveals finished correctly at every size.

The native contact dialog opened, contained keyboard navigation, closed with Escape and returned focus to Message Me. Message fields remained disabled. Project notes and guestbook fields also remained disabled; no submission requests or success states were implemented. There are no verified external project URLs in the data, so outbound destinations could not be tested; existing conditional link markup is preserved.

Fresh reduced-motion desktop rendering and live preference changes restored every project, removed all pin spacers/inert attributes and reset hero-art transforms. Smooth scrolling became automatic. No-JavaScript desktop content stayed visible; no-JavaScript mobile navigation remained usable. Chapter browser history, the hero-to-Vault anchor, contact anchor, direct IELTS project deep link and the explicit list escape passed separately.

The clean development preview also passed React Strict Mode startup, exactly-one-pin checks, live reduced-motion rebuilding, finished masks for every section heading/collage card/milestone number and keyboard skip-link focus. The main landmark now has `tabIndex={-1}` so skipping content places focus as well as moving the viewport. [Development results](preview/phase3/dev-results.json).

After the final production rebuild, an additional four-size smoke pass confirmed HTTP 200, skip-link focus, settled contact-trigger entrance, dialog focus return, reduced-motion project restoration and absence of overflow/runtime errors. [Final production smoke results](preview/phase3/production-smoke-results.json).

Screenshots were captured and actually examined at all four sizes. Normal-motion screenshots show completed entrances; reduced-motion snapshots also exist. Review caught and corrected the stepped paper edge obscuring the hero footnote. A short [desktop scroll recording](preview/phase3/desktop-scroll.webm) captures opening, native wheel scrolling through the layered Vault, reverse input and list escape. A sampled recording contact sheet was also inspected locally. Viewport snapshots avoid the misleading tall pin-spacer representation in full-page captures. Only an unfocused offscreen skip link is suppressed during screenshots; it remains available in the application.

## Performance and lifecycle observations

A production Chromium sample measured 179 animation-frame intervals during scrolling: median **16.7ms**, p95 **16.8ms**, **zero tasks over 50ms**. Initial observed CLS was **0**. These are local headless observations, not a guaranteed desktop frame rate, physical phone test or integrated-GPU benchmark.

Five initial resize/preference cycles retained exactly one desktop pin and none in mobile/reduced modes. DOM nodes stayed at 1228. The initial run's heap rose from 4,097,348 to 5,547,432 bytes and listeners from 372 to 385; a longer warm follow-up checked for accumulation. At cycles five and ten, nodes remained 1228, listeners remained 372 and heap changed from 4,711,016 to 4,789,084 bytes (about 78KB). This supports stable warm DOM/listener cleanup; it does not prove the absence of every possible memory leak.

[Primary results](preview/phase3/browser-results.json), [extended results](preview/phase3/extra-results.json).

## Reproduce

Start the production preview with `npm run build` then `npm start -- --hostname 127.0.0.1 --port 3001`. Install Playwright into a separate temporary tooling directory, with Chromium and FFmpeg available, then run:

```bash
NODE_PATH=/path/to/qa/node_modules \
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome \
node scripts/check-motion.cjs

NODE_PATH=/path/to/qa/node_modules \
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome \
node scripts/check-motion-extended.cjs
```

With `npm run dev -- --hostname 127.0.0.1 --port 3001` running, the same tooling variables can run `node scripts/check-motion-dev.cjs` for Strict Mode/final-state/skip-link checks.

`PORTFOLIO_URL` can override the default preview URL. The scripts regenerate documentation screenshots/results; the extended script also records video and compares warm lifecycle metrics.

## Corrections and limits

Reduced-motion review found ScrollTrigger restoring an inline smooth setting; CSS now overrides it under that preference. Exhibition teardown also explicitly restores static project layers under reduced motion. Direct pin scrubbing prevents delayed scene catch-up from interfering with navigation. A stale Turbopack development-cache reference caused a dev compiler panic; only generated `.next/dev/cache` was moved aside for a clean restart. No downloaded references, production assets or source files were deleted.

Physical-device, full screen-reader and extended GPU profiling remain unperformed. The hero entrance may replay when crossing animation media breakpoints; content settles quickly and reduced motion stays immediate. List mode intentionally persists until reload. The original concept art remains labelled and all unverified project metadata remains unchanged. No Supabase, message/comment API, deployment or Phase 4 work was performed.
