# Creative room motion — validation

Implemented on 2026-10-12 from organizational checkpoint `fc875b79e6f759778adca346a84ee66d58d72e00`. This work preserves the existing homepage prototype, content, database, authentication and MFA. No library, paid service, migration, publishing backend, deployment or fake personal asset was added.

## Alignment: actual cause and fix

The public layout had independently specified gutters: Home navigation used `clamp(16px, 2.6vw, 44px)`, while inner navigation/content used `clamp(20px, 4vw, 64px)`. On a 1440px viewport, the brand moved from **37.44px to 57.59px**. Inner pages also hid the desktop location label and used a larger wordmark, altering the three-part header's space distribution and pushing navigation rightward.

Measurements found body, main and PageMotion wrappers at **x=0 with no residual transforms**. The reserved scrollbar gutter stayed constant. This was CSS configuration, rather than a pinned hero leaking a transform or a `100vw` error. [Before measurements](preview/motion/alignment-before.json), [Home before](preview/motion/before-home.png), [About before](preview/motion/before-about.png).

Public navigation and inner content now share `--public-gutter`. Inner desktop header spacing, wordmark size and location slot match Home. Mobile keeps the location hidden on both. No negative margin, body translation or scroll-lock workaround was introduced. The homepage's deliberately inset editorial compositions remain intact.

| Viewport | Home/inner brand x | Inner heading x | Desktop navigation x, both shells |
| -------- | -----------------: | --------------: | --------------------------------: |
| 1440px   |            37.44px |         37.44px |                          515.86px |
| 1366px   |            35.52px |         35.52px |                          482.58px |
| 390px    |               16px |            16px |                 Mobile disclosure |
| 360px    |               16px |            16px |                 Mobile disclosure |

The preliminary gutter probe injected the edited CSS into the old production preview to isolate its effect; the final route checks used the actual rebuilt application. [Compiled application measurements/results](preview/motion/room-motion-results.json). All measured public wrappers remained at x=0; no horizontal overflow occurred.

## Motion and interaction

`RouteTransitions` persists in the public layout. Two fixed folio leaves cover the change, then reveal the matching Next pathname/query commit. `TransitionLink` keeps normal anchors, external and modified clicks, no-JavaScript navigation and reduced motion. Router history/scroll restoration are retained. The controller cancels/replaces interrupted timelines, supports popstate, moves focus into the arriving page without scrolling, and clears slow/failed covers with a 2.4s watchdog. It never transforms a layout wrapper or freezes the router tree.

- **Home:** the four worlds, original typography entrance, project focus, diagonal paper handoff and curated Vault choreography are unchanged. Chapter links and the existing floating contact remain available.
- **About:** warm vertical shutters, masked heading choreography, framed portrait reservations, image unfolding/depth and the existing verified milestone reveals.
- **Work:** acid-lime diagonal leaves, independently revealed exhibition previews, small pointer-driven artwork motion, query-based category changes and closer project-detail framing. Filter-owned contexts/listeners revert when categories change. Collaboration retains editable canonical project context and the private contact interface.
- **Journal:** oxblood horizontal leaves, a slower horizontal title mask, ruled margin opening and a reading-progress template for future real entries. Prose itself remains stationary.
- **Gallery:** paired stone curtains, alternating image masks, restrained illustration response and a native full-screen viewer. Close/Escape, Tab trapping/restoration, previous/next, arrow keys and a touch-swipe shortcut are implemented. Images are contained in the viewer rather than cropped; only the selected full-screen media is rendered.
- **Links:** a blue/gray horizontal handoff, editorial directory highlight strips and arrow feedback. Only the existing verified identity is published.
- **Guestbook:** sage handoff and larger literary visitor text/dividers, with the same approved-only comments and submission logic.
- **Admin:** public cinematic effects are excluded; existing login/MFA/inbox/moderation components are untouched.

Navigation rules, visible focus states and arrow feedback use CSS. GSAP owns room imagery/typography; Motion retains its original contact controls. There is no permanent cursor tracker, smooth-scroll replacement, blur loop or WebGL. “One last detail” in the footer reveals **Simply Lovely** through a keyboard/touch-accessible button; the phrase lives in `site.discovery`.

See [motion architecture](MOTION_ARCHITECTURE.md) for lifecycle/ownership details.

## Tests actually run

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; all existing public, work/album, admin and API routes remain present.
- `npm run test:backend` — **35/35 passed**, with existing database permission, validation, CAPTCHA/quota and owner/MFA regression fixtures.
- `scripts/check-room-motion.cjs` — passed against the production build at **1440×900, 1366×900, 390×844 and 360×800**. Each ran Home → About → Work → SAT’chi → Back → Journal → Gallery → album/viewer → Links → Guestbook → Home.

Focused Chromium verifies matching navigation/heading gutters, hero focus, restored Work scroll position after Back, project comment target, collaboration payload and confirmed receipt, modal Tab/Escape/restoration, gallery arrow navigation/focus, approved guestbook fixture display, the discovery, no extra Vault pins, and no page errors/overflow. Stress checks include rapid replacement/cancellation, query-filtered server content, **18 repeated route changes**, nested reload, actual anonymous owner-inbox rejection (401) and the admin login redirect. Reduced motion removes cinematic enhancement/pins and uses immediate normal navigation. A final targeted `scripts/check-navigation-resilience.cjs` run also passed: enabling reduced motion during the early cover still completes the requested navigation, normal-motion Back works after resetting the preference, and shared navigation aligns at intermediate 960/820/700px widths. [Resilience results](preview/motion/navigation-resilience.json). Server-rendered work category navigation also passes without JavaScript.

Browser public availability, Turnstile challenge, approved comments and private-message success responses are explicit fixtures. This validates UI integration; it is **not a fresh hosted Supabase/Turnstile or owner/MFA acceptance test**. No private inbox content, owner credential, TOTP code or real visitor submission was recorded. Existing backend/security source files and migrations have no diff.

The historical whole-site suites were not rerun; their old single-page assumptions remain documented in `ORGANIZATION_VALIDATION.md`. Two focused runs were justified by visual refinement: the first passed functional checks; inspection then prompted consistent header slots, stronger paper-nav hover contrast and settled screenshot timing. The final production build includes those corrections. After a final fallback refinement, targeted resilience checks, TypeScript and ESLint were run again; ordinary route choreography is unchanged.

## Visual evidence and performance limits

Desktop/mobile screenshots were opened and inspected, including About, Work, Journal, Gallery, the viewer and a mid-wipe frame. The final recording was captured and sampled frames were inspected; no claim of a physical-device review is made.

- [About desktop](preview/motion/desktop-about.png) / [mobile](preview/motion/mobile-about.png)
- [Work](preview/motion/desktop-work.png) / [diagonal wipe](preview/motion/desktop-exhibition-wipe.png)
- [Gallery mobile](preview/motion/mobile-gallery.png) / [full-screen viewer](preview/motion/mobile-viewer.png)
- [Journal at 360px](preview/motion/narrow-journal.png)
- [Guestbook fixture](preview/motion/desktop-guestbook-fixture.png)
- [32-second desktop route journey](preview/motion/recordings/desktop-room-journey.webm)

A separate [Chromium/CDP sample](preview/motion/performance-sample.json) measured six local handoffs at **858–945ms**, including automation/network overhead. Work returned to **210 descendant DOM nodes and zero pins** across revisits. After explicit garbage collection, heap usage was approximately **5.84MB initially and 8.23MB after warming other rooms**; router/module caches are included. Two long tasks were observed, **159ms and 57ms**. This is evidence of a small local sample, not a guarantee of 60 FPS, zero leaks or physical-phone performance. The bundled ScrollTrigger instance was not exposed globally, so total trigger count was not inspected; DOM/pin stability and scoped cleanup are the verified boundaries. The initial diagnostic probe expecting a global plugin failed, then the measurement was narrowed to available CDP/DOM instrumentation.

Real portraits, personal photographs and journal entries still need to be supplied. The article-progress template compiles but cannot be visually validated on a genuine article while the journal is empty. No fictional content was created to fill that gap. Shared-element snapshot morphs were not introduced; current route transitions prioritize stable navigation and reserved real media. Full owner publishing/image uploads and anonymous two-way replies remain separate tasks.

## Repeat locally

```bash
npm run build
npm start -- --hostname 127.0.0.1 --port 3005
```

Optional browser tooling remains outside application dependencies. With Playwright available in your environment and a Chromium executable configured:

```bash
PORTFOLIO_URL=http://127.0.0.1:3005 node scripts/check-room-motion.cjs
PORTFOLIO_URL=http://127.0.0.1:3005 node scripts/check-motion-budget.cjs
PORTFOLIO_URL=http://127.0.0.1:3005 node scripts/check-navigation-resilience.cjs
```

The actual checks used external Playwright from `/tmp/otabek-browser-qa/node_modules` via `NODE_PATH`, and `PLAYWRIGHT_CHROMIUM_PATH=/home/otabek/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`. No package was installed into this repository. Normal development remains `npm run dev -- --hostname 127.0.0.1 --port 3001`.
