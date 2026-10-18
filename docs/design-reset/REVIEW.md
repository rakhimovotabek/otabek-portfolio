# The Other Side of Default — review

Review branch: `design/other-side-of-default-20261018`, based on `606934d`. No merge or production deployment. The original working tree was clean; local main was three commits behind the reviewed checkpoint. No existing uncommitted work was discarded.

[Open the visual comparison and video board](review.html). This is a local evidence file, not a new application route.

## Direction and implementation

Two standalone concepts were rendered and examined: [Typographic Aperture](concepts/aperture.png) and [Signal / Field Notes](concepts/signal.png). [The side-by-side criteria](DIRECTION.md) select Aperture for its clear identity, graphic silhouette and room for personal content. Signal contributes only one learning trace. The original four-column hero and blue Work composition are replaced.

- **Home:** condensed identity, original ink portal, reversible portal expansion and receding-room handoff into a citrus learning exhibit; three different index objects; honest Now/Lately state; quiet correspondence ending.
- **Work:** ink catalog cover, question/answer-sheet SAT’chi object, independently opening plum Huquq folio, all five canonical projects, URL category filters, truthful empty categories and existing collaboration/contribution controls. Genuine captures and canonical comment targets remain on project detail pages.
- **Gallery:** crop-to-print transformation, opposing bounded print rails, URL filters, collection table, native modal viewer with focus return, keyboard navigation and simulated touch swipe. Stable album and media IDs retained. Authored vector studies are explicitly demonstration artwork; personal photos are absent.
- **About:** factual name and portrait reservation, preserved biography, verified milestones with progressive path, readable interests and factual details.
- **Journal:** serif reading room and native folded-leaf interaction. No invented posts; existing reading routes retained.
- **Links:** address-book composition and one verified public identity, with keyboard/hover focus response.
- **Guestbook:** correspondence cover and original moderated comments/form infrastructure. No fabricated messages or private inbox content.

The KIMI principle becomes the receding Home handoff and trajectory drawing; Marcus contributes spatial type/art hierarchy; Jack contributes bounded opposing rails and tactile print interactions. All geometry and code are authored here. [Assets and licenses](ASSETS.md) document original CSS/SVG objects and the self-hosted OFL Anton face. No proprietary reference assets, likenesses, shaders, testimonials, metrics or exam questions are shipped. No new runtime dependency.

## Actual screenshot evidence

Opening comparisons use the same viewport and scroll 0. Mid captures use exactly scroll 768 at 1366 × 768. Scene frames use normalized scene progress because the new scenes have different lengths.

| View | Before | After |
| --- | --- | --- |
| Home / desktop | [Baseline](before/1366-home.png) | [New](after/1366-home-opening.png) |
| Home / scroll 768 | [Baseline](before/1366-home-mid.png) | [New](after/1366-home-mid.png) |
| Work / desktop | [Baseline](before/1366-work.png) | [New](after/1366-work-opening.png) |
| Work / scroll 768 | [Baseline](before/1366-work-mid.png) | [New](after/1366-work-mid.png) |
| SAT exhibit / semantic stage | [Baseline checkpoint](before/1366-work-sat.png) | [New](motion/1366-sat-50.png) |
| Huquq folio / semantic stage | [Baseline checkpoint](before/1366-work-law.png) | [New](motion/1366-law-100.png) |
| Gallery / desktop | [Baseline](before/1366-gallery.png) | [New](after/1366-gallery-opening.png) |
| Gallery / scroll 768 | [Baseline](before/1366-gallery-mid.png) | [New](after/1366-gallery-mid.png) |
| Home / 390px | [Checkpoint baseline](before/390-home.png) | [New](after/390-home-opening.png) |
| Work / 390px | [Checkpoint baseline](before/390-work.png) | [New](after/390-work-opening.png) |
| Gallery / 390px | [Checkpoint baseline](before/390-gallery.png) | [New](after/390-gallery-opening.png) |
| About | [Baseline](before/1366-about.png) | [New](after/1366-about-opening.png) |
| Journal | [Baseline](before/1366-journal.png) | [New](after/1366-journal-opening.png) |
| Links | [Baseline](before/1366-links.png) | [New](after/1366-links-opening.png) |

Also: [Gallery table](after/1366-gallery-table.png), [phone table](after/390-gallery-table.png), [phone viewer](after/390-gallery-viewer.png), [Guestbook](after/1366-guestbook-opening.png), [phone About](after/390-about-opening.png), [phone Journal](after/390-journal-opening.png), [phone Links](after/390-links-opening.png), [phone Guestbook](after/390-guestbook-opening.png), [correspondence form](after/1366-guestbook-sheet.png), [private contact dialog](after/1366-contact.png).

Desktop baselines were freshly captured before editing. Mobile and project-stage baseline images reuse the actual captures committed in `606934d`; they are not presented as fresh captures. The initial phone recapture overlapped source edits and was discarded. [Evidence ledger](EVIDENCE.md).

## Motion recordings

- [Home — 8.8 seconds](motion/home.webm): aperture, advancing room, reverse scroll. [Extracted frames](motion/home-contact-sheet.jpg).
- [Work — 14.5 seconds](motion/work.webm): both independent exhibits, forward/reverse. [Extracted frames](motion/work-contact-sheet.jpg).
- [Gallery — 10.4 seconds](motion/gallery.webm): crop expansion, rail movement, viewer open/change/close. [Extracted frames](motion/gallery-contact-sheet.jpg).
- [Phone Gallery — 7.8 seconds](motion/mobile-gallery.webm): simulated touch swipe, close and native collection scroll. [Extracted frames](motion/mobile-contact-sheet.jpg).

The desktop videos are 1280 × 720. Phone recording is 390 × 844. All were made against the production build and reviewed through extracted frames. [Durations and file sizes](verification/videos.json). Each Home, SAT, law and Gallery sequence has actual 0/25/50/75/100 frames in `motion/`; the About trajectory has its own five-frame set. The comparison board exposes the primary frame sets with a progress slider.

## Verification results

| Check | Result / evidence |
| --- | --- |
| Typecheck | Passed, [log](verification/typecheck.log) |
| ESLint | Passed, [log](verification/lint.log) |
| Production build | Passed with installed Next 16.4 / React 19.3, webpack, [log](verification/build.log) |
| Backend/security suite | 35 passed, no failures, [log](verification/backend.log) |
| Focused browser checks | 26 passed, [JSON](verification/browser.json), [log](verification/browser.log) |
| Accessibility | 18 axe scans including [two contact states](verification/contact.json), zero violations on tested openings/viewer/dialog; one intentional scene palette per page |
| Responsive | 29 route/width checks, 320/360/390/768/1024/1366/1440; no document overflow; measured opening controls have no targets below 44px |
| Forms/data | All five canonical project comment IDs mount; SAT context remains editable under a browser-only availability fixture; zero contact POSTs; empty/failed reads and unavailable submissions stay honest |
| Navigation/viewer | Work/Gallery URL filters, native Back, album deep links, keyboard arrows/Enter/Escape, dialog focus return and simulated swipe passed |
| Enhancement fallback | Reduced motion, no-JS reading/links, live preference change, phone resize teardown and delayed image dimensions passed |
| External links | Four public URLs returned HTTP 200; [reachability evidence](verification/external-links.json). No external product login/submission |
| Backend boundary | No diff in backend libraries, API routes, admin/auth/MFA, migrations, RLS or tests |

No live submission, authenticated MFA journey, real phone or production data access was attempted. The preview clears Supabase connection/key variables. The contact availability fixture is local to the test browser; it does not make the backend available or fake success.

The production bundle does not expose a global ScrollTrigger registry. The supplemental [registry-introspection probe](verification/lifecycle.log) returned **unknown**; exact orphan-trigger counts are not claimed. Scoped GSAP context/matchMedia teardown was reviewed in source, repeated native navigation and rapid successive clicks to Work/Gallery/About passed, and the browser directly confirmed restored flow and removed inert state after reduced-motion and breakpoint changes. This distinction is intentional.

Earlier failures are retained: stale generated `.next/dev/types` broke the first build; moving only that generated cache outside the repository resolved it. The first reverse-state assertion was too strict about matrix serialization; touch injection initially omitted a required identifier; both harness issues were corrected. Browser-discovered viewer/status/tab contrast defects and the clipped Huquq action were fixed and remeasured. The first phone video lost its local server; it was re-recorded successfully. [Logs](verification/).

## Performance on this laptop

One headless Chromium tab, production server, no video recording during sampling, local network. Mobile simulation uses a 390 × 844 touch context with 4× CPU throttling. RAF intervals measure scheduling, not physical display FPS. LCP is a local lab observation, not a WAN or field claim.

| Configuration | Scene | Median / p95 RAF | Max gap | Warm scroll long tasks | Observed CLS |
| --- | --- | --- | --- | --- | --- |
| desktop (1× CPU) | home | 16.7 / 16.8 ms | 16.8 ms | 0 | 0.000 |
| desktop (1× CPU) | sat | 16.7 / 16.7 ms | 16.8 ms | 0 | 0.000 |
| desktop (1× CPU) | law | 16.7 / 16.8 ms | 16.8 ms | 0 | 0.000 |
| desktop (1× CPU) | gallery | 16.7 / 16.7 ms | 33.4 ms | 0 | 0.053 |
| mobile-simulation (4× CPU) | home | 16.7 / 16.7 ms | 16.8 ms | 0 | 0.054 |
| mobile-simulation (4× CPU) | sat | 16.7 / 16.8 ms | 16.8 ms | 0 | 0.000 |
| mobile-simulation (4× CPU) | law | 16.7 / 16.8 ms | 16.8 ms | 0 | 0.000 |
| mobile-simulation (4× CPU) | gallery | 16.7 / 16.8 ms | 16.8 ms | 0 | 0.000 |

No warm-scroll long tasks were observed in these 2.4-second scene traversals. Cold 4× CPU Home hydration produced 94/187/98ms tasks; Work had a 56ms task and Gallery 54ms. Observed CLS peaked at 0.054 on mobile Home and 0.053 on desktop Gallery. This leaves room to improve font/scene initialization. Local observed LCP was 116–348ms on desktop and 196–220ms in the mobile simulation; these numbers are not a field-performance promise. [Raw samples and resource attribution](verification/performance.json).

All-route chunk disk footprint was approximately 1352KiB before and 1492KiB after (+140KiB, about 10%). This is an approximate artifact comparison, not a controlled first-route transfer measurement. The source font adds 170812 bytes; authored SVGs total 6248 bytes. Measured initial Home script resources were approximately 276kB desktop / 271kB phone encoded bytes, including prefetch variation. Existing legacy styles still support detail/forms/admin surfaces. [Asset accounting](verification/assets.json).

## Still weak / intentionally unfinished

- The portrait, personal photographs, drawings and journal entries are missing owner assets. The Gallery is a demonstrated design system with authored abstract studies, not a completed photographic exhibition.
- Secondary rooms have complete readable compositions and modest interactions; bespoke shutter/fold/tab navigation arrivals were deferred. Native route navigation avoids cover delays and remains reliable.
- Project roles, dates, stacks, outcomes and statuses remain unknown wherever the owner has not supplied them. Details retain existing evidence instead of invented case-study claims.
- Font loading and initial scene setup still cause measurable layout shift; cold 4× CPU hydration has the long tasks above. Legacy style removal and deeper bundle reduction are future focused work.
- Exact internal ScrollTrigger registry counts, real-device touch, field Web Vitals/INP, live contact/moderation and authenticated MFA were not verified. No CMS or two-way chat was implemented.

## Working notes

[Architecture](ARCHITECTURE.md), [design system](../DESIGN_SYSTEM.md), [asset provenance](ASSETS.md), [reproduction commands](verification/README.md).

Applied skills: UI design Direction/Build (aesthetic direction; colors, typography, responsive design, heading groups, landing pages and buttons), UI animation (scroll-animation guidance), UI verification (session setup; axe, viewport stress, console/network and Web Vitals probes), and Sites portable/local preview guidance. No skill or plugin sent messages, registered hosting, or deployed a site.
