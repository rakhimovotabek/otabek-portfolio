# The Other Side of Default

The combined brief of 18 October 2026 supersedes the former four-world hero and blue/paper Work compositions. The public visual system is now **Typographic Aperture**, selected after two browser-rendered experiments. See `design-reset/DIRECTION.md`, `ARCHITECTURE.md` and `ASSETS.md` for decisions and boundaries. Previous visual implementations remain in git history and some unused components; they are not the design template.

## Foundations

`src/app/other-side.css` is the controlling, public-only layer after the existing base styles. `.other-side` scopes the new tokens so private admin styling is independent. Legacy CSS still supports forms, detail reading and viewer behavior.

| Role | Value |
| --- | --- |
| Ink | `#101114` |
| Paper | `#f4f0e8` |
| Portal / print accent | `#a7ddd4` |
| Learning | `#d6ef66` |
| Law folio | `#493447` |
| Print mat | `#252927` |
| Shared gutter | `clamp(20px, 3.5vw, 56px)`, 22px on phones |
| Display | Anton, self-hosted SIL OFL; `--font-aperture` |
| Body / controls | Existing DM Sans |
| Literary / quiet phrases | Existing Newsreader + true italic |

Each scene has one principal accent. No glow, WebGL, third-party imagery or background rendering loop. Titles use explicit responsive sizes and compact leading; paragraphs retain 16–18px mobile/desktop reading size. Small uppercase labels are metadata only. Typeface novelty does not enter form controls.

## Page compositions

- Home: three-line condensed title, tilted arched portal, honest personal statement and a direct Work action. An optional native-scroll sequence expands the portal and admits the citrus learning exhibit as the first room recedes. A dossier, folded note and print provide three different entrances to the archive. Now/Lately remains an honest empty space.
- Work: giant ink catalog cover with project-specific print silhouettes. SAT’chi is a loose question/answer-sheet object; Huquq Test is a hinged plum examination folio. Artwork is conceptual and labeled. All five canonical projects remain in a URL-filtered index. Details retain genuine product screenshots and project comments. Only existing verified public repositories receive contribution actions.
- Gallery: rectangular crop aperture, opposite print rails and a conventional filtered collection table. Three original vector studies demonstrate the system, explicitly separate from personal photographs. Native modal semantics, keyboard arrows, Escape, focus return and touch swipe remain in the existing viewer. Real photos/portraits still await owner assets.
- About: factual name behind an honest portrait reservation; readable biography and semantic milestone list with a small progressive vector path. No invented dates or portrait.
- Journal: expressive serif masthead and a single native folded-leaf disclosure. No fictional personal posts. Existing detail routes remain readable.
- Links: spatial address tabs and public identity rows; only verified URLs. Focus/hover nudges the selected title without moving document layout.
- Guestbook: correspondence cover, unanimated inputs and existing approved-comment/moderation behavior. Empty/offline states never masquerade as testimonials or submission success.
- Footer: quiet correspondence invitation and the centrally configured discovery text.

## Motion and accessibility

`components/default/public-motion.tsx` owns the new scroll scenes. One timeline per scene; no competing scroll library or React updates per frame. GSAP matchMedia/context cleanup restores all transforms, crop masks and `inert` flags on resize, preference change and unmount. Sticky motion requires fine pointer, 1024px width, 650px height and no reduced-motion preference. All other configurations use ordinary document flow. Each large sequence has an ordinary anchor to later content.

The header stays on the shared gutter and uses native mobile details navigation, including Escape and focus return. Header contact replaces the obstructing floating trigger. Public navigation uses native Next Link behavior with no covering route overlay; changing routes restores main focus without overriding scroll restoration. Detail pages and forms do not require cinematic scrolling.

One H1 per page. Decorative artwork uses hidden or grouped descriptions, no duplicated letter-by-letter accessible text. Keyboard controls have visible current-color outlines; large dialog controls preserve existing semantics. No JavaScript leaves the server-rendered content, native filters, index links, disclosures and album routes available; forms explain that JavaScript is needed.

## Content and security

Nickname changes only in `src/data/site.ts`. Facts remain in `portfolio.ts`; media and writing in `archive.ts`; public adapters preserve canonical IDs in `universe.ts`. Unknown facts remain null. Supabase configuration, APIs, validation, MFA, owner sessions, moderation, RLS and migrations are unchanged. Preview runs with backend access disabled. No CMS, chat, migration or production deployment belongs to this iteration.
