# Work + Gallery visual reset

Review branch: `design/work-gallery-checkpoint-20261018`. Baseline: `f5dac8b`. This checkpoint is not deployed or merged.

## See the change

Each comparison places the earlier production capture on the left and the new production capture on the right. Screenshots are only resized and labeled in the comparison sheets; full-resolution originals are retained.

- [Work rooms: opening, SAT’chi, Huquq Test](comparisons/work-rooms.webp) — identical 1366×768 viewports and scroll coordinates.
- [Work archive and ending](comparisons/work-archive.webp) — corresponding sections at their new positions.
- [Gallery: opening, transformation, album](comparisons/gallery.webp) — opening and transformation use identical coordinates; album compares the old route viewer with the new direct dialog.
- [Mobile openings](comparisons/mobile.webp) — identical 390×844 viewports and y=0.
- [Before capture manifest](before/states.json) / [after capture manifest](after/states.json). The actual before captures are reused unchanged from the preceding checkpoint’s `overhaul/after/` evidence, not newly recreated versions of the old design. `matchedBaseline` explicitly identifies coordinate pairs. Additional captures show the new scene endpoints.

## What changed

SAT’chi is a blue/citron learning poster with an oversized name, expanding subject sheet and separate journey fragment. Huquq Test is a plum examination folio on warm paper; it enters as a different room and separates its paper layers. The former screenshot-led displays are removed from these exhibits. Both new compositions are visibly labeled art-directed portfolio studies, without fabricated scores or product claims. Genuine interface captures remain available on the case-study routes.

The archive changes to a dark typographic cabinet: two compact featured entries, three typographic poster marks, and native Notes disclosures. All five project routes, descriptions, comments, collaboration and contribution actions remain. A paper/plum invitation replaces the previous blue ending. Header correspondence becomes quiet text with a compact outlined arrow; the working contact dialog is retained.

Gallery changes from the old three-study arrangement to a large oval aperture with a typographic overprint. Scrolling opens the aperture into a full image field, then resolves into an unequal contact sheet on paper. Clicking a print opens the existing native viewer directly, growing from its actual source bounds and releasing the crop. The standalone album route remains. Keyboard navigation, swipe, Escape, focus restoration and scroll unlocking are verified.

[Art direction, exact asset provenance and reference mapping](ART_DIRECTION.md). Strade informed room-scale handoffs and typography across exhibit boundaries; the saved BeanTab material informed product emphasis and tactile details; Folitox informed the print/folio presentation. The existing progress-clock architecture follows the previously inspected 21st/Systaliko pattern. No reference imagery or unlicensed assets were copied.

The product posters are original HTML/CSS artwork. Gallery adds three original SVG prints: `interval.svg`, `counterform.svg`, `intersection.svg` (9,995 bytes total). Existing genuine captures were `public/images/work/sat-landing.webp`, `sat-sign-in.webp` and `huquq-sign-in.webp`. `huquq-navigator-demo.webp` is the previously documented component demonstration, not a raw application capture. Earlier site studies were also available. No personal photography was found in the scoped project assets. The new prints are explicitly site artwork and can be replaced through the existing album/media data contract.

## Evidence and checks

- 20 unchanged baseline screenshots, 33 new production-preview screenshots and four complete browser recordings are included.
- Production build, TypeScript and ESLint passed. Backend fixture suite: 35/35 passed; no production writes.
- [Browser results](verification/results.json): 320, 390, 768, 1024 and 1366px layouts; overflow, image loading, reverse scroll, scene jump controls, inactive-room inertness, native disclosures, contact prefill/close, project comments mount, header contact, mobile menu and album behavior.
- Reduced motion and JavaScript-disabled modes retain normal-flow content, links and native disclosures. No scroll pinning is activated in these modes.
- Homepage focus phase, public routes, all five case-study routes, anonymous owner rejection and repeated Work/Gallery client navigation passed. No captured runtime errors or stale pin spacers.
- Scoped axe runs have zero detected violations. Some contrast checks over artwork remain incomplete in axe; this is not a claim of a complete accessibility audit. [Manual palette checks](verification/contrast.json) supplement these results. Two contrast defects found during verification were fixed and the production build was retested.
- Two-second browser scroll probes: Work p95 17.3ms, max 27.3ms; Gallery p95 21.3ms, max 25.8ms. No observed long tasks in either sample. These are local Chromium observations, not field performance or a Lighthouse score. No new dependencies, raster hero downloads or animation engines were added.

Browser helpers: `scripts/verify-hard-reset.cjs`, `scripts/capture-hard-reset.cjs`, `scripts/record-hard-reset.cjs`. They use the existing external Playwright/axe installation via `NODE_PATH`; it is not added to production dependencies. Run them against a production preview with `PORTFOLIO_URL` and `PLAYWRIGHT_CHROMIUM_PATH` set as appropriate.

## Motion

- [Work: forward and reverse](recordings/work-scroll.webm) / [observed progress](recordings/work-progress.json).
- [Gallery: aperture, image field, contact sheet, reverse](recordings/gallery-scroll.webm) / [observed progress](recordings/gallery-progress.json).
- [Desktop album opening/navigation/close](recordings/1366-album.webm).
- [Mobile album opening/navigation/close](recordings/390-album.webm).
- [Clip metadata](recordings/clips.json). Complete browser captures at normal speed, including loading/warmup, with no trimming or interpolation. Desktop viewport 1366×768, recorded at 910×512; mobile 390×844. Recording can hitch on this host; these clips show the visual sequence and are not frame-rate benchmarks. The progress traces and separate scroll probe identify the limits of this evidence. An earlier trim calculation dropped the start of the Gallery sequence; the delivered files are the complete source captures instead.

## Limits

Personal photographs still require owner-supplied content. The new artwork interprets the products rather than claiming to reproduce application screens. Mobile and reduced-motion modes deliberately use normal scrolling instead of desktop scene choreography. Live authenticated messaging/comment submission and owner MFA were not exercised; their backend implementation and security configuration were not changed. Current GetLayers/dqnamo pages could not be inspected through the research browser, so their implementation is not cited as directly studied.
