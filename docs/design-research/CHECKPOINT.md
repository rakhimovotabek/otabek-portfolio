# Work / Gallery checkpoint — 18 October 2026

Review branch: `design/work-gallery-checkpoint-20261018`, based on `b49190f`. Checkpoints 0–2 only. No production deployment.

**Ink project posters, paper contact sheets, and original artifacts with visible provenance.**

Open [the visual review](review.html). It includes the viewport/state selector, before/after screenshots, normal-speed recordings, and both rendered direction alternatives. Direct comparisons: [Work](work-comparison.png), [Gallery](gallery-comparison.png). Native captures: [before](before/), [after](after/). Opening comparisons use the same route, viewport and scroll 0; later scenes use corresponding normalized progress/sections, with actual after coordinates in [states.json](after/states.json). Shorter pages intentionally change absolute scroll distances. Baseline was captured in Webpack development mode after the cached Turbopack preview failed; final captures use the successful Turbopack production build. Dev indicators in baseline are not design changes.

## What changed

- Work’s route title is subordinate to SAT’chi. The opening now includes its real one-sentence description and a case-study link, inside 1366×768. Original project geometry and the two-project poster → mounted exhibit sequence remain. Huquq’s mounted artwork uses the same larger frame as SAT’chi. Provenance stays at 14px instead of shrinking with art. Internal arrows now point into the archive.
- Work uses 280svh instead of 340svh; its scroll travel falls from 240vh to 180vh. Extra geometry rotation and the copy’s hidden entrance were removed. The title/art relationship and deterministic reverse scroll remain. Mobile puts the working link before the 4:3 artwork; original data, all five projects, complete Notes, category empties and collaboration remain.
- Gallery’s three **original site studies** now sit on paper: one full 4:5 lead, two smaller natural-ratio companions, readable captions and a visible collection link. No personal photographs are invented. No 300svh spectacle for a site-study-only archive. The photo-capable scene stays in source, selected when published photography exists; it is not exercised by the current content. Existing album expansion, directional masks, arrows, synthetic swipe and Escape are retained.
- Shared tokens are scoped to these routes: Ink/Paper roles, rare ultramarine, DM Sans + Newsreader italic, the existing gutter, 12/8/4 columns, measure and easing. No new runtime dependency or font. Homepage artwork/timelines, admin, Supabase, content IDs, authentication, MFA, messaging and comment code are unchanged. The shared PageMotion wrapper and scene wrapper now retain actual DOM scopes through route teardown; no homepage animation parameters changed.

## Evidence and measured limits

[Discovery scorecard](DISCOVERY.md) and [reference ledger](REFERENCE_LEDGER.md) document what was actually inspected. Local Strade/Beantab screenshots remain outside git; their missing bundles and offline limitations are explicit in [local evidence](beantab-evidence.md). No third-party code, template prompt or artwork was imported. Reference ideas: [Strade](https://www.strade.tech/) for staged project sequencing; [Lumora](https://www.getlayers.ai/layer/lumora) for restraint; [Folitox’s public directory](https://folitox.com/portfolio-templates) for editorial index/media hierarchy. These links are inspiration, not license grants.

[Work recording](after/recordings/work-scroll.webm) and [Gallery recording](after/recordings/gallery-scroll.webm): 15.4s / 15.6s, browser viewport 1366×768, encoded 910×512, normal speed. A real browser clock drives native scrolling forward and back; loading is trimmed, motion is not accelerated. [Desktop album](after/recordings/1366-album.webm) and [mobile album](after/recordings/390-album.webm): 19.24s / 19.88s, including selection, arrows, Escape and Back; mobile recorded at 390×844. [Baseline Work excerpt](before/recordings/work-excerpt.webm) and [Gallery excerpt](before/recordings/gallery-excerpt.webm) retain normal speed; full source recordings also remain. Timed decoded contact sheets accompany the videos. Sequence frames and browser state measurements were inspected; this is not a claim of subjective real-time video playback through an unavailable video-viewing tool.

Subjective score changes (0–5, owner approval still required): Work focal point 3→4, restraint 3→4, orientation 3→4, mobile 3→4. Gallery focal point 2→4, restraint 2→4, orientation 3→4. Artwork remains 2/5 on both: original site geometry cannot replace the owner’s photographs or verified application screenshots. Removing animation does not earn extra motion points.

## Verification

- `npm run typecheck`, `npm run lint`, `npm run build`: pass. Additional evidence scripts linted after creation.
- `npm run test:backend`: **35 passed**, 0 failed; [log](verification-backend.log). PGlite/local fixtures, not live Supabase/MFA.
- Production browser: 1366×768, 1024×768, 768×844, 390×844, 320×844. No document overflow in Work/Gallery; mobile uses normal flow. All three Gallery media masks are `none` from the opening; original aspect ratios retained. Main Gallery link is in the first laptop viewport and passes a real hit test clear of the fixed contact launcher.
- Work forward/reverse, exhibit selection, native Notes, physical-category empty state, five detail routes, comment target mount, reload and Back: pass. Home hero reaches its original focus phase. Public route loop includes Journal, About, Links, Guestbook and Home. Fifteen client Work/Gallery changes keep header x exactly **35.515625px**; no pin spacers accumulate.
- Viewer: arrows, focus trap, Escape, opener focus restoration, scroll unlock, browser Back; mobile synthetic swipe. No physical touch-device or pinch/zoom claim.
- Reduced motion and JavaScript disabled: main headings, media, plain links and native disclosures readable; no enhanced scroll ranges. Gallery targets measured ≥44×44px. Main source content remains server rendered.
- Scoped axe: no reported violations for Work exhibit, Gallery desktop/mobile and viewer. Raw results retain incomplete entries (including overlapping scene text and decorative arrow contrast); these are not called passes. Fixed-background practical text is Ink/Paper; colour over drawings needs human review.
- Anonymous owner API returns 401; `/admin` remains outside public scene styling. No real login, MFA, comment submission, inbox write, email or chat sent. The preview’s public config is `reads: true`, `submissions: false`, `siteKey: null`: collaboration context/open/close is verified; editing and real submission are **untested/disabled**. No configuration or security bypass introduced.

Warm 2s Work sample before the scope-only fix: 121 scheduling intervals; p95 17.1ms, max 19.4ms, no sampled >50ms long task, 306 DOM nodes, ~23.8MB JS heap; 0.165s task time across 2.023s wall time. This is one Chromium software-rendered laboratory sample, not GPU FPS, INP/TBT, field performance or a low-power guarantee. No equivalent before-build CPU/heap trace was collected, so no performance speedup is claimed. Page length and removal of the site-study scene are the directly demonstrated resource reductions.

The first full browser run logged repeated GSAP invalid-scope warnings. A traced ScrollTrigger refresh ran between React clearing the previous room ref and its passive cleanup. Both scene and page wrappers now capture the mounted element as their scope; the clearing run rejects any remaining invalid-scope warning. The exhibit chooser also has a semantic group role. The dialog probe waits for React’s scroll-unlock cleanup instead of racing the native close event. Prior raw results remain alongside the clearing evidence.

## Remaining / next review

Real project screenshots and owner photographs are the principal visual gap; upload specs and the route→data→identifier map are in [Discovery](DISCOVERY.md). About, Journal, Links and Guestbook directions are prepared only; those pages were not redesigned. The current Gallery has no personal photography, so its photo-collage progress states and real photo selection remain deferred, not marked tested. Safari/Firefox, physical mobile, field INP and live MFA/writes were not inspected. No services purchased, dependencies added, schemas/policies changed, or production deployed.

## Reproduce

With the optional Playwright/axe install outside the repository and the existing Chromium binary:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3005
```

In another terminal, set `NODE_PATH=/tmp/otabek-browser-qa/node_modules` and `PLAYWRIGHT_CHROMIUM_PATH=/home/otabek/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`, then run `node scripts/verify-design-checkpoint.cjs`, `node scripts/capture-design-checkpoint.cjs`, or `node scripts/record-design-checkpoint.cjs`. One browser worker, one server. `ffmpeg` is used for trimming/encoding the recordings. The preview server is stopped at handoff.

## Final clearing run

Final production build, lint, TypeScript and focused browser run passed after both scope fixes. **0 invalid-scope warnings, 0 uncaught page errors, 0 console errors**. The prior semantic group incomplete is cleared. The remaining raw log contains 6 CSS preload warnings and 19 navigation-aborted RSC prefetch requests; no failed asset response or unexpected HTTP error. Gallery/viewer contrast incompletes concern decorative arrows; Work also requires manual review of overlapping scene text.

Final warm Work sample: 121 intervals, p95 17ms, max 17.6ms, 0 long tasks, 306 DOM nodes. This does not establish a before/after speedup. The final layout matches the recorded layout; subsequent fixes only retained DOM scopes and labeled the exhibit control group.

Tooling: Playwright 1.64.1, axe Playwright 4.14.0, existing Chromium 153.0.8010.12. All remain outside project dependencies. See [final raw results](verification/results.json) and [production build log](build.log).
