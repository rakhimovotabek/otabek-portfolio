# Gallery — Beantab reference and visual exhibition

Scope: Gallery and its existing album detail/viewer only, from `ad624ec`. Work, homepage, other inner pages, content records, Supabase, authentication/MFA and database policies are preserved. No deployment or new application dependency.

## Reference investigation

Discovered actual files in the parent project directory:

- `BeanTab — kafe va restoranlar uchun kassa dasturi.html`
- `BeanTab — kafe va restoranlar uchun kassa dasturi_files/site.css`
- `BeanTab — kafe va restoranlar uchun kassa dasturi_files/main.js`
- accompanying `css2` and WebP/PNG images (17 files in the saved directory).

[Beantab](https://beantab.uz/) returned **200 in Chromium**, although the web text tool could not access it. Live browser observations and computed values are in `preview/gallery-direction/reference/measurements.json`. Reference screenshots stay outside the repository at `/tmp/otabek-beantab-reference/`; no proprietary graphics or source are redistributed.

Verified in the live browser:

- Unbounded display / Manrope body type; the desktop h1 computed at 61.47px. Dark surfaces, warm light text and localized gold contrast.
- A dominant central phone with two angled supporting screens. Their progress values changed from .174 to .609; the central screen moved from -3.68px to -12.88px vertically, while the side screens moved from 42.07px to 28.27px. Depth and unequal offsets are observed, not inferred.
- Stock-screen chips moved independently in opposite directions while the main screen retained its perspective angle.
- Pointer tilt produced about 1.8° X / 2.1° Y at the sampled pointer position.
- Hover enlargement became visible and loaded the full image. Clicking pinned it and moved focus inside; Escape dismissed it.

Read source timing: hover waits 420ms; zoom opacity is 200ms and its .96→1 scale is 250ms, using `cubic-bezier(.2,.7,.1,1)`. These are source-defined timings, not fitted recordings. The live hero rendered its layered scene, but its 3D trajectory/timing was not measured or reproduced.

The saved download lacks `hero3d.js`, `food3d.js`, remote font binaries, several full-resolution zoom images and AVIF/srcset variants. Their import/URLs remain in the HTML/JS. The live full-table zoom was accessible; its full-resolution resource is not part of the local download. Those omissions prevent treating the saved folder as a complete offline copy. Reference code has no established redistribution license, so the implementation uses original GSAP code and existing portfolio assets.

## Visual concept and two interactions

**One composition:** a folded triptych, one dominant close-up, then the same frames unfolding onto paper. Three published site studies replace the old five unrelated mounts/reservations. There are no fabricated personal photographs.

**Restrained palette:** near-black `#111114`, warm paper `#F2EFE7`, ultramarine `#284BFF`. The existing original SVG shapes receive a Gallery-only color treatment. Source artwork elsewhere and future photographic images retain their records. Alt descriptions for the locally recolored studies match the visible colors. There is no added glow, blur, WebGL, particle field or device mockup.

**Typography:** existing DM Sans for the large “Ways” shapes and utility text, Newsreader italic for “of seeing” and “view,” mono for subordinate metadata. The route masthead is compact; collection information uses native expandable details. A title-led collection index replaces duplicated large previews and paragraphs.

1. **Scroll exhibition:** center frame leads two perspective wings. At 16–43% progress the wings recede and the center grows to 2.7× for a cropped close-up. At 62–90% the frames move into a large, unrotated triptych while a solid paper plane rises underneath. Side apertures open with their movement. The ending uses the original captions and one collection action. The paper handoff replaced an initial color blend after screenshots showed a muddy grey plateau and weak navigation contrast. A further screenshot review caught its inherited 100% CSS translation being added to the GSAP offset; explicitly setting pixel Y to zero fixed it. A coverage assertion now checks the actual surface bounds, since axe classified its unreadable caption contrast as incomplete rather than a violation.
2. **Album viewer:** the existing native dialog expands its visual plane from the selected frame's measured rectangle (650ms). Next/previous use directional clipping and paired translation (550ms); closing returns toward the originating mount with a shorter 420ms movement. Buttons remain usable throughout opening, and rapid image input replaces the current sequence. Arrow keys, native focus containment, Escape, focus return and touch swipes are retained. There is no automatic hover modal.

The ScrollScene lifecycle and Work/About branches stay intact; only Gallery's timeline delegates to `gallery-motion.ts`. Native sticky, one progress clock, 300ms scrubbing and scoped teardown remain. The folded CSS composition also applies while the motion bundle is loading, avoiding a late first-layout jump. Small viewports, reduced motion and no JavaScript use ordinary large static mounts.

## Evidence

`preview/gallery-direction/before/`: production baseline screenshots captured before editing, at **1366×900** and **390×844**. Includes opening, desktop 0/25/50/75/100% progress, collection index, album page and native viewer.

`preview/gallery-direction/after/`: final equivalent states and additional 320px / 1024px, reverse, viewer opening/mask, reduced-motion and no-JavaScript captures. Progress states are equivalent positions within the scene; index/album states use equivalent section alignment. The masthead heights differ intentionally. `results.json` records measurements and checks.

`preview/gallery-direction/after/recordings/gallery-and-album.webm`: actual forward/reverse wheel scrolling, the collection route transition, opening the viewer, next/previous changes and closing. Recorded from a 1366×900 viewport at 910×600. A contact sheet was extracted at 2fps and inspected: `after/motion-contact-sheet.png`. The recording is 22.24 seconds long.

Only original portfolio screenshots/video and our own reference measurements are committed. Saved Beantab assets remain untouched in the parent directory.

## Verification and resource management

Focused harness:

```sh
NODE_PATH=/tmp/otabek-browser-qa/node_modules \
PLAYWRIGHT_CHROMIUM_PATH=/home/otabek/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
node scripts/check-gallery-direction.cjs
```

Final results: **TypeScript, ESLint, production build with webpack, and the focused production browser harness all passed**. Five scoped axe runs reported zero violations; runtime/console errors were zero. The Gallery paper coverage and reverse bounds, Work geometry, homepage focus, viewer focus/touch/rapid input and route cleanup assertions passed. The build uses a per-command 1536MB V8 heap cap; no repository configuration changes. Browser tooling is reused outside the application; one browser and one server are used at a time, with the browser closed before builds. No historical backend suite or unrelated redesign.

The browser checks composition changes and reverse geometry, overflow, static frame bounds, gallery/detail URLs, dialog open/next/previous/rapid input/close, touch navigation, focus return and containment, history departure while the viewer is open, scroll unlocking, reduced motion and no-JavaScript rendering. Work's original 27% artwork geometry is compared with the committed evidence, and the homepage focus phase is checked. Raw axe output retains incomplete results; zero violations is not blanket accessibility certification.

The warm 120-frame forward/reverse sample recorded a **p95 interval of 18.8ms**, a **maximum of 24.3ms**, and **no observed tasks over 50ms**. The idle production server used approximately **147MiB RSS** in the sampled process listing. These are main-thread scheduling observations, not GPU FPS, physical-phone measurements or field Web Vitals. Host memory pressure and another active application were observed during development; timings cannot be attributed solely to the Gallery.

## Preview server diagnosis

At the start there was **no Next process or listener on 3005**. Exit 137 is conventionally consistent with SIGKILL, but no kernel/systemd log identified an OOM kill of the previous preview process. Journald reported memory pressure earlier that day. That is contextual evidence, not a demonstrated cause. An external termination or memory-related termination remains possible; the prior exit's cause is **unconfirmed**.

The original production build started successfully for the baseline. Development first compilation was slow under host load, and the capture hit pending-navigation waits; those development captures are replaced by production evidence. The final production preview became ready in 440ms and `/gallery` returned HTTP 200. It was deliberately stopped after testing; no exit 137 was reproduced during this task. All temporary processes started for this task are stopped when finished.

## Limits

- Current imagery consists of three explicitly labeled original site studies. Personal photographs are not yet available; no upload administration/backend is added. Existing ArchiveMedia/GalleryAlbum contracts and URLs continue to accept real images.
- Desktop scroll choreography is gated below 800px or 600px height. Mobile/reduced-motion use static compositions; reduced-motion viewer changes are immediate.
- The viewer can navigate all album images, while the opening exhibition selects at most three. Gallery descriptions remain in expandable sections/detail pages.
- A brief initial static composition can appear before client hydration; this is visible at the beginning of the recording. No CLS or field Web Vitals benchmark was run.
- The fullscreen viewer requires JavaScript; no-JavaScript album images and native information disclosures remain readable.
- No physical phone, Safari, screen-reader session, signed-in MFA or live form submission was exercised. Backend source is unchanged.
- The existing public header/contact launcher/correspondence footer remain. This checkpoint does not propagate the design to other pages.
