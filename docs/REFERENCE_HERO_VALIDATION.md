# Reference-driven opening rebuild

Reviewed on 2026-10-11. Baseline: `45400b14b1030c798297777a307a89de8780b0c4`. Scope ends at the four-world hero and first editorial transition. No deployment, database migration or authentication redesign.

## Source and implementation

Inspected the owner's `otabek_reference_hero_demo.html`, the 960×600 motion video and the saved Yanis Schweizer HTML before making changes. The working prototype supplies the actual composition, CSS geometry and normalized scroll timing; it is adapted into React markup, a CSS module and the existing GSAP lifecycle. No iframe, Strade code or Strade assets are redistributed. All three parent-directory references remain unchanged.

The opening retains four worlds under the enormous overlapping full name, the dark setting, project depth, spreading panels and the seven-degree paper wipe with orange/blue/lime rules. Worlds link to Software, Writings, Visual Archive and About Me. The smaller brand stays centrally configured as `default`. Original concept previews are labeled; fake application statistics were removed. Portrait, visual work and verified project screenshot slots use the existing typed content records.

Enhancements include staggered inner characters, separate scroll-controlled outer characters, a horizontal project mask, restrained device perspective, nested hover layers, a progress rule, focus-safe layer switching and the overlapping paper-to-editorial handoff. Native CSS sticky scrolling replaces the prototype's per-frame handler; GSAP handles one reversible normalized timeline. Mobile uses two-by-two worlds and a shorter 290svh sequence, with copy above the project artwork. Reduced motion and unavailable JavaScript restore a single readable opening.

## Matching-state screenshots

Focus frames use normalized progress .56; diagonal-wipe frames use .90. Editorial frames align the next section's top with the viewport. The prototype and production Next.js build were both opened in Chromium.

| State                 | Prototype                                                        | Updated website                                                |
| --------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Desktop opening       | [1440px](preview/reference-hero/prototype-desktop-opening.png)   | [1440px](preview/reference-hero/website-desktop-opening.png)   |
| Desktop project focus | [1440px](preview/reference-hero/prototype-desktop-focus.png)     | [1440px](preview/reference-hero/website-desktop-focus.png)     |
| Desktop diagonal wipe | [1440px](preview/reference-hero/prototype-desktop-wipe.png)      | [1440px](preview/reference-hero/website-desktop-wipe.png)      |
| Desktop editorial     | [1440px](preview/reference-hero/prototype-desktop-editorial.png) | [1440px](preview/reference-hero/website-desktop-editorial.png) |
| Mobile opening        | [390px](preview/reference-hero/prototype-mobile-opening.png)     | [390px](preview/reference-hero/website-mobile-opening.png)     |
| Mobile project focus  | [390px](preview/reference-hero/prototype-mobile-focus.png)       | [390px](preview/reference-hero/website-mobile-focus.png)       |
| Mobile diagonal wipe  | [390px](preview/reference-hero/prototype-mobile-wipe.png)        | [390px](preview/reference-hero/website-mobile-wipe.png)        |
| Mobile editorial      | [390px](preview/reference-hero/prototype-mobile-editorial.png)   | [390px](preview/reference-hero/website-mobile-editorial.png)   |

Additional matching frames at 1366×900 and 360×800, plus reduced-motion/no-JavaScript frames, are in the same directory. Actual screenshots were visually inspected at all four widths. Review corrected a doubled GSAP wipe translation, inherited editorial typography, writing-paper link color, obscured collage titles and mobile artwork/text spacing.

## Validation actually run

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; homepage is static and existing owner/API routes remain dynamic.
- `npm run test:backend`: **35/35 passed**, exercising database permissions/RLS, validation, quotas, approved-only comments, owner/MFA boundaries, moderation and session behavior through the existing PGlite/Auth fixtures. This is not new hosted owner acceptance.
- `scripts/check-hero-reference.cjs`: passed on the production build at **1440×900, 1366×900, 390×844 and 360×800**. Compares real world-panel geometry with the prototype; mobile matches exactly, desktop differences are at most 11px because the application reserves a scrollbar gutter. Checks opening/focus/wipe, forward/reverse and fast jumps, sticky position stability, navigation/project anchors, covered-control focus rescue, dialog Tab/Escape/focus restoration without scroll displacement, reduced-motion teardown, no horizontal overflow and no page errors. JavaScript-disabled mobile checks passed for visible worlds, compact opening, native navigation and editorial content. [Machine-readable results](preview/reference-hero/hero-browser-results.json).

The first comparison stopped on Playwright waiting for a scheduled navigation after an already completed native anchor click. Native clicks now use `noWaitAfter` followed by explicit hash/position assertions; the subsequent complete four-size run passed. An earlier development spot check timed out waiting for network idle; final checks use DOM readiness plus the actual animation-ready class. Neither failed attempt is counted as a pass.

A separate production browser smoke check at 390px passed all five canonical project discussion disclosures, guestbook field visibility, anonymous inbox denial (401), `/admin` redirect to `/admin/login`, owner-login rendering and no overflow. It made no hosted writes. [Community smoke results](preview/reference-hero/community-smoke-results.json). Owner/MFA operations are covered by the backend regression fixtures, not a new live owner login.

The broad historic archive, motion and full community browser suites were not rerun in this bounded checkpoint. Their hero selectors were updated to the new full-name markup so useful tests remain maintainable. Backend routes, migrations, authentication, visitor forms, comments and guestbook logic are unchanged. No new hosted messages, owner password/TOTP use, private inbox screenshots or production deployment occurred.

## Differences and limitations

- Existing working navigation and Message me replace the prototype's demonstration header/controls.
- Visual Archive uses original line artwork rather than the prototype's experiment chart; all writing/portrait reservations remain truthful.
- The SAT’chi device contains labeled illustrative learning content rather than fabricated product metrics. Add a verified screenshot to replace it.
- Mobile project typography/artwork is separated for readability; its shorter scroll distance is intentional.
- “More / than code.” introduces the retained biography. Later sections keep their existing archive direction; they have not received a broader rebuild.
- No cursor-light loop, animated blur, extra dependency, smooth-scroll library or new raster asset was added. These checks do not establish a guaranteed frame rate on modest hardware. Physical-phone/browser testing and a recording were not captured.

Preview: `npm run dev -- --hostname 127.0.0.1 --port 3001`. Content editing and motion ownership are documented in `ARCHIVE_CONTENT.md` and `MOTION_ARCHITECTURE.md`.
