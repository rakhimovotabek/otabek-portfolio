# Signature scenes — implementation and browser evidence

Validated on 2026-10-14 in the existing `otabek-portfolio` repository. This is a frontend motion/composition change, not a new site or a deployment. Homepage choreography, personal facts, Supabase handlers, migrations, authentication and MFA source are unchanged.

## Visible result

- **Work:** the opening blue exhibition is visible on arrival. Its original SAT’chi artwork moves more than half a screen across the composition, shrinks into an angled left mount, rotates its own SVG geometry and opens right-hand project details. A stone/charcoal Huquq Test scene replaces it through a layered vertical handoff. Project links, exhibit jump controls, skip navigation, collaboration and the full directory remain functional.
- **Gallery:** five unequal frames start as a collage. The central image grows to 2.5×, while surrounding frames translate, rotate and recede. The same frames then return as a straight contact sheet on a light surface. The source uses the existing published-album media contract. Three images are original site studies; two are clearly reserved photographic frames.
- **About:** large type accompanies three honest photo reservations. Scrolling opens the stack into a spread, moves the story to the opposite side, reveals its next chapter with a mask, then reduces the frames beside a milestone heading. The actual verified achievements immediately follow. The full biography remains readable below.
- **Journal:** an oxblood native folio opens and folds with Enter/Space. The empty state remains honest; no article is fabricated.
- **Links:** the actual GitHub profile remains a direct external link. A native address disclosure opens a sage strip, and the copy button uses the real Clipboard API with confirmation in place.
- **Guestbook:** approved notes receive serif message setting, separate author/date metadata, unequal correspondence mounts and a margin line that draws as entries arrive. Submission logic is untouched.

The original oversized route headers used most of the first viewport. Compact mastheads bring all three signature compositions into view on arrival. The original before captures are preserved.

## Evidence locations

All paths below are relative to this repository:

- `docs/preview/signature/before/`: original top and scroll-600px captures at **1440×900**, plus original signature-route mobile captures at **390×844**. Guestbook captures use a plainly labeled browser fixture.
- `docs/preview/signature/after/{work,gallery,about}-top.png`: final opening views at the same desktop dimensions.
- `docs/preview/signature/after/{work,gallery,about}-scene.png`: matching scroll-600px comparisons.
- `docs/preview/signature/after/{work,gallery,about}-{0,25,50,75,100}.png`: five states of each signature scene.
- `docs/preview/signature/after/recordings/{work,gallery,about}.webm`: forward and reverse motion recordings, **960×600**, generated from a 1440×900 browser viewport.
- `docs/preview/signature/after/*-measurements.json`: measured artwork bounds at all five states, plus reverse samples.
- `docs/preview/signature/after/axe-*.json`: raw scene WCAG scan output, including incomplete checks.
- `docs/preview/signature/after/signature-results.json`: scene, responsive, reduced-motion and no-JavaScript assertions.
- `docs/preview/signature/integration/`: desktop/laptop/mobile/narrow screenshots, homepage focus, viewer, route-cover and guestbook fixtures; `room-motion-results.json` contains navigation and alignment measurements.
- `docs/preview/signature/details/`: Journal, Links, Guestbook, native interaction, 320px and community failure screenshots; `details-results.json` contains functional results.
- `docs/preview/signature/performance.json`: production main-thread/RAF, layout-shift and repeated-navigation sample.

## Checks performed

- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build -- --webpack`: pass. Initial Turbopack development compilation stalled; the single server was switched to webpack. No compiler configuration or package change was required.
- `scripts/check-signature-scenes.cjs`: five states, large composition changes, reverse bounds within 2px, active/inert exhibit controls, collaboration dialog focus restoration, no pin spacers, 1440×900 / 1024×768 / 390×844 / 320×800 layouts, reduced motion and no-JavaScript.
- Nine scoped scene WCAG scans at start / middle / end: zero violations after correcting contrast in a background word and an About reservation label. Artwork/background-related incomplete checks remain in the raw files; they are not treated as passed checks.
- `scripts/check-room-motion.cjs`: preserved homepage focus, common navigation alignment, route transitions, interrupted/rapid navigation, category query changes, history restoration, nested reload, gallery keyboard viewer and focus trap, contact fixture delivery and canonical project context, approved-comment fixtures, anonymous admin denial, reduced motion and no-JavaScript filters. Viewports: 1440×900, 1366×900, 390×844 and 360×800.
- An About mask defect was reproduced: the 75% frame retained a 100% closed inset while opacity changed. Consistent percentage units and a sharp mask-only reveal corrected the snapping. The clearing probe checks intermediate clipping and prevents focus on its covered link.
- A history defect was reproduced: Work restored 170px above its saved position. Client layout reservation before enhancement corrected the clamp caused by shorter server markup. The original history test then passed.
- `scripts/check-signature-details.cjs`: Enter/Space folio control, actual clipboard read-back, approved-note presentation, pending-moderation submission fixture, no optimistic approved entry, injected server/malformed/offline/empty responses and real retry requests, 320px layouts, owner route availability and anonymous 401.
- `scripts/check-signature-performance.cjs`: sequential warm forward/reverse scroll samples at normal and **4× CPU throttle**, and eight client navigations with forced-GC memory/DOM samples.

Optional browser tooling lives in `/tmp/otabek-browser-qa/node_modules`; Chromium uses the existing binary at `/home/otabek/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`. No browser or animation framework was added to the application. One server and one browser process were used at a time.

## Performance findings

Normal-speed production sampling recorded p95 RAF intervals near **16.8ms**, with no tasks over 50ms during the sampled scrolling. Stress results varied between runs: earlier 4× CPU samples were around 16.8ms; the retained stress sample reached **33.4ms Work**, **50ms Gallery**, and **33.2ms About**, with one Gallery long task. The machine was therefore not consistently sustaining the same frame cadence under artificial load. These are scheduling observations, not proof of GPU-rendered FPS on every device. The final run returned to 16.7–16.8ms for Work/About at 4× throttle, with Gallery at 33.3ms and no long tasks. Both the latest run and the slower stress sample are retained.

Initial non-input layout-shift sums were **0.0274 Work**, **0 Gallery**, and **0.0187 About** in this sample. Enhancement/font settling still causes small shifts; this is not a claim of zero CLS.

After eight route changes, Work returned to **290 DOM nodes, one signature scene and zero pin spacers**. Forced-GC heap changed from **6.50MB to 8.86MB**, including warmed route/module caches. This small sample does not prove absence of every memory leak, and total internal ScrollTrigger count was not exposed.

There is no added WebGL, Lenis, constant blur, particle loop or permanent will-change promotion. Movement uses transforms/opacity, with local clip masks and surface-color changes.

## Limits and remaining imperfections

- The owner still needs to provide real photographs and portraits. Reservations are visible and honest. No photo-upload administration/backend was added; existing media records accept future local image paths, dimensions, captions and credits.
- Mobile/reduced-motion/no-JavaScript use static responsive compositions. The full desktop scrollytelling is intentionally gated below 800px or 600px height.
- Journal has no published personal entries. Its article-opening/reading behavior could not be tested with real published content; the existing detail-route transition was preserved.
- Live configuration reports **reads enabled, submissions disabled, no configured challenge site key**. UI delivery/moderation tests use explicit intercepted fixtures and never send a test message to the hosted database. Live message delivery, moderation administration and a signed-in MFA session were not exercised.
- No physical phone, screen-reader session, field INP/Web Vitals, alternate-theme/pseudo-locale matrix or full historical backend suite was run. The site has one authored public palette. Browser emulation and scoped axe checks are narrower evidence.
- Images that zoom can be cropped; the existing full-screen album viewer provides the complete images. Final art direction should be reviewed again when real photos replace the reservations.

See `SIGNATURE_REFERENCES.md` for installed skills, source/dependency/license review and `SIGNATURE_MOTION.md` for timeline/lifecycle details.
