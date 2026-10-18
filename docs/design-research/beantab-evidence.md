# Local reference evidence

Inspected the actual parent-directory downloads. All HTTP(S) requests were blocked in an isolated browser context; no forms or downloads submitted.

## Beantab

`../BeanTab — kafe va restoranlar uchun kassa dasturi.html` (64,536 bytes), saved `site.css` (61,495), `main.js` (34,137), CSS font declarations and 16 local PNG/WebP assets. Screenshots: `../reference-inspection/beantab-opening.png` and `beantab-scroll.png` at 1366×768, outside git. The opening shows gold/ink type with an empty right-hand stage; the saved snapshot is not evidence of working 3D.

Observed source mechanisms: IntersectionObserver reveal (unobserves after entrance), fine-pointer tilt, passive scroll sampled through requestAnimationFrame, clamped hero opacity, scroll-linked phone/stock transforms, image zoom with Escape, reduced-motion branches. The script explicitly bypasses reveal hiding for `navigator.webdriver`: a headless capture does **not** establish its natural reveal timing. `hero3d.js` and `food3d.js` are imported but absent locally. Remote font binaries are unavailable offline. Browser movement differs from the original live site and no frame-accurate timing claim is made. The large gold gradient/3D treatment was rejected for this archive.

## Strade

`../Yanis Schweizer_ I build apps, automations and AI tools.html` (69,753 bytes), two saved CSS files, two saved JS entry modules and 13 local image assets inspected. Screenshots: `../reference-inspection/strade-opening.png` and `strade-scroll.png`, outside git. The four-world composition and immense name are visible. The module imports `preload-helper.CVfkMyKi.js`, GSAP and ScrollTrigger bundles that are absent from the saved folder; its complete scroll choreography cannot run in this isolated snapshot. Source-inline transforms are a captured state, not a measured animation curve.

Neither download is an asset license. Nothing from either download is distributed in the repository.
