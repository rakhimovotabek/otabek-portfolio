# Checkpoint 0 — observed baseline

Starting HEAD: `b49190f` (14 October). Next 16.4 / React 19.3 / GSAP 3.15 / Motion 14 / Supabase 2.117. Clean starting tree. One local preview on port 3005; cached Turbopack failed with a stale-task panic, so preview uses `next dev --webpack`. No UI source changed before captures and direction comparison. Browser tooling installed in `/tmp/otabek-browser-qa` only; existing Chromium reused, one worker.

[Desktop contact sheet](before/desktop-contact-sheet.jpg) · [Mobile contact sheet](before/mobile-contact-sheet.jpg). Individual native-size captures in `before/`: 1366×768 and 390×844. Opening/feature/handoff/resolved/ending for Work and Gallery. These are actual browser captures, not generated images. The initial cold screenshot sweep was repeated after waiting for scene enhancement; final native captures are authoritative. Contact sheets are orientation aids.

Scores are subjective 0–5, no 5 awarded. Order: personality / focal point / restraint / type / artwork / orientation / motion / mobile. Motion scores concern the existing scene behavior; missing media limits the rating.

| Route | Scores | Anchor | Three concrete limitations |
|---|---|---|---|
| Home | 4/4/3/4/3/4/4/4 | Full name across four worlds | Busy lower handoff; concept art replaces project proof; no personal photo. Preserve source. |
| Work | 3/3/3/4/2/3/3/3 | SAT’chi over blue geometry | Opening art/caption extends below laptop viewport; initial project CTA hidden by timeline; mounted Huquq art is undersized with a large dead gap. |
| Gallery | 3/2/2/4/2/3/2/3 | “Ways of seeing” and blue volume | Competing page and exhibit titles; 300svh scroll devoted to three synthetic site studies; captions/collection unavailable in first view. |
| About | 3/3/3/4/1/3/3/3 | Serif name / reserved portrait | Missing portrait; stacked empty frames consume mobile viewport; achievements below opening. Direction only. |
| Journal | 3/3/3/4/0/3/2/3 | “In the margins” | No real entries; huge folio given to empty copy; fold control distracts from an empty reading room. Direction only. |
| Links | 2/4/4/4/0/4/2/4 | One GitHub identity | Oversized treatment for one record; redundant framing; no verified additional public identities. Direction only. |
| Guestbook | 3/3/3/4/0/3/1/3 | “A trace of your visit” | Public records need async load; large text-first opening; room has no owner-supplied visual artifact. Preserve moderation. |

Anti-pattern check: no invented metrics/testimonials, no gradient-centered new hero, no imported stock, no repeated new bento cards. Existing issues selected for correction: duplicated display hierarchy, tiny provenance labels, long study-only scroll, internal links marked with an external arrow. No additional decorative loops warranted.

## Direction decision before implementation

[Paper prototype](directions/1366-gallery-paper.png) versus [electric prototype](directions/1366-gallery-electric.png), both rendered at 1366×768. Original page media reused only inside browser prototypes. Paper: focal 4, restraint 4, artwork inspection 4; electric: focal 3, restraint 2, artwork inspection 3. Paper wins because the full lead study and both companions fit, type has its own column, and art stays distinct from the background. Final implementation must correct prototype caption/footer crowding and keep its CTA clear of the fixed contact launcher.

Thesis: **Ink project posters, paper contact sheets, and original artifacts with visible provenance.** Work retains its existing sequence; Gallery’s site-study state becomes still. Contact-sheet-to-photo motion is deferred until owner photography exists; the existing photo-capable choreography and album viewer are retained.

## Source and edit map

| Route / data | Authority | Edit path / boundary |
|---|---|---|
| Home | `src/data/hero.ts`, `portfolio.ts`, owner prototype | Existing hero modules retained; no changes |
| Work / details | `src/data/portfolio.ts` → `universe.ts` | Same five slugs; same `commentProjectId`; complete descriptions remain in native Notes and detail |
| Gallery | `archive.ts:visualStudies` → `universe.ts:galleryAlbums` | `site-studies`, three original SVGs; no personal photos. No schema changes |
| Journal | `universe.ts:journalEntries` | Empty; no fabricated entries |
| Brand / links | `site.ts`, `universe.ts:publicIdentities` | No nickname change; verified GitHub only |
| Public messages/comments | Existing API/repository and Supabase | Read-only smoke + fixture tests; no live writes |
| Owner | Existing auth gateway, cookies, owner allowlist and MFA | Source unchanged; live MFA requires owner session, untested |

## Later route directions and personal asset gaps

About: one 4:5 portrait, 1600px longest edge, then quiet verified milestone rail. Journal: remove empty folio spectacle when real prose arrives; preserve poem breaks and reading measure. Links: compact grouped index as verified identities grow. Guestbook: approved textual notes and a stable form; no staged endorsements. These are directions, not implemented pages.

Needed: real SAT’chi and Huquq screenshots (16:10/4:3, 1600–2000px wide); original photographs (2000px wide, retained originals), drawings (natural ratio), alt text/captions and explicit publication choice. Strip location metadata before future publishing. No URLs, stacks, dates or project status guessed. CMS remains future scope.
