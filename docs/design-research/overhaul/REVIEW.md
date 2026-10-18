# Visual review checkpoint

Start with the actual browser comparisons below. Before: `6238fa3`. After: this checkpoint. Both use Chromium at **1366 × 768** and **390 × 844**, identical scroll coordinates recorded in `before/states.json` and `after/states.json`. These are browser captures, not mockups.

[Work side-by-side](work-comparison.webp) · [Gallery side-by-side](gallery-comparison.webp). Contact sheets only resize and label the original screenshots; full-resolution captures are linked below.

## Work

| State | Before | After |
| --- | --- | --- |
| Opening, y=0 | [Before](before/1366-work-opening.png) | [After](after/1366-work-opening.png) |
| SAT’chi, y=556 | [Before](before/1366-work-sat.png) | [After](after/1366-work-sat.png) |
| Huquq Test, y=1247 | [Before](before/1366-work-huquq.png) | [After](after/1366-work-huquq.png) |
| Index, y=2387 | [Before](before/1366-work-index.png) | [After](after/1366-work-index.png) |
| Collaboration, y=3181 | [Before](before/1366-work-ending.png) | [After](after/1366-work-ending.png) |
| Mobile opening, y=0 | [Before](before/390-work-opening.png) | [After](after/390-work-opening.png) |
| Mobile Huquq, y=595 | [Before](before/390-work-huquq.png) | [After](after/390-work-huquq.png) |

SAT’chi replaces the abstract blue poster with its real landing and sign-in interfaces, overlapping on a citron field. Huquq Test uses a plum field with its actual Yangiariq sign-in and a clearly labeled source-component demonstration. The original reversible timeline still swaps artwork and typography; a small secondary movement separates the interface planes. Descriptions and project identifiers are unchanged. Verified live-app and public contribution links now resolve to the owner’s projects. Capture provenance: [ASSETS.md](ASSETS.md).

## Gallery

| State | Before | After |
| --- | --- | --- |
| Opening, y=0 | [Before](before/1366-gallery-opening.png) | [After](after/1366-gallery-opening.png) |
| Main transformation, y=450 | [Before](before/1366-gallery-transformation.png) | [After](after/1366-gallery-transformation.png) |
| Previous collection position, y=562 | [Before](before/1366-gallery-collections.png) | [After at identical y](after/1366-gallery-collections.png) |
| Album viewer | [Before](before/1366-gallery-album.png) | [After](after/1366-gallery-album.png) |
| Mobile opening, y=0 | [Before](before/390-gallery-opening.png) | [After](after/390-gallery-opening.png) |

The former static study index becomes a scattered-print exhibition: oversized, offset prints → immersive crop → an asymmetrical hanging on paper. The existing Gallery scroll engine handles both directions. Forest, peach, slate and terracotta replace the repeated blue panels. Every print is linked to its corresponding album image; the existing frame-to-viewer opening, directional image transitions, keyboard/swipe controls and focus return are retained.

Gallery now has a longer desktop scroll sequence. The old collection coordinate therefore shows a different stage; [current collection overview](after/1366-gallery-collections-current.png), [unfolded arrangement](after/1366-gallery-unfolded.png) and [close crop](after/1366-gallery-focus.png) are additional semantic captures, not falsely presented as identical scroll positions. Mobile has an unpinned, staggered image sequence. No personal photographs were found; all three existing studies remain explicitly labeled original site artwork. Future real photographs use the same album/media system.

## Shared interface and movement

Desktop navigation increases from 11px to 14px and gains more balanced spacing. Contact moves into the header, using the existing contact dialog and collaboration prefill. No floating contact control covers the artwork. Homepage scene code and the Simply Lovely Easter egg are unchanged.

- [Work forward / reverse](recordings/work-scroll.webm)
- [Gallery forward / reverse](recordings/gallery-scroll.webm)
- [Desktop album opening and image changes](recordings/1366-album.webm)
- [Mobile album opening and image changes](recordings/390-album.webm)
- [Previous checkpoint recordings](../after/recordings/)

Recording metadata is in `recordings/clips.json`. Motion playback is real time, with only loading warmup trimmed.

## Validation and limits

See [verification/results.json](verification/results.json) for viewport checks, reversible motion, hit testing, native viewer keyboard/swipe/focus handling, reduced-motion and no-JS fallback, route transitions, project comment mounts, collaboration/contact dialogs, scoped axe scans and measured browser performance.

Authenticated product screens were not captured. The Huquq question navigator is the owner’s original component rendered with demonstration numbers, not a claim of real exam activity. Contact submissions are disabled in this local environment, so no message or comment was submitted. Live admin/MFA login was not attempted; the existing backend fixture tests cover authorization and MFA. No production database, deployment or security settings were changed.


Validation completed: `npm run build`, `npm run typecheck`, `npm run lint` (the initial unused-variable warning was fixed and the changed files rechecked), and all **35 backend tests** passed. Production browser checks passed at 320, 390, 768, 1024 and 1366px, plus reduced-motion and JavaScript-disabled modes. Six scoped axe scans reported no violations; transformed artwork left some contrast checks incomplete, supplemented by the explicit scene-color calculations in [contrast.json](verification/contrast.json), all above 9:1. These scans do not establish a whole-site accessibility certification.

Performance: four local WebP assets total **136,170 bytes (133 KiB)**, with no new library or font. The production Work native-scroll probe collected 121 frames over 2.02s: **17ms p95**, 18ms maximum, no observed long tasks, 0.145s main-thread task time and approximately 21.4MB reported JS heap. This is a local desktop headless probe, not a mobile-device benchmark or a Core Web Vitals measurement. Browser logs retain Next route-prefetch CSS preload warnings and expected aborted requests on navigation; no page errors or console errors occurred.
