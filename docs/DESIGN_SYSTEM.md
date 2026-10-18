# Personal archive design system

The site is an editorial collection: presence, selected software, an archive index, a reading room, a visual notebook, parallel interests, milestones, visitors and correspondence. Earlier forms and security behavior are preserved. There are no fabricated personal artworks, photographs, project screenshots, metrics or social profiles.

The current opening supersedes the Phase 5 paper-volume cover. It is adapted from Otabek’s supplied working HTML, not copied from the saved Strade page. The four narrow colored worlds, huge overlapping full name, original illustrated SAT’chi focus and diagonal striped paper wipe are preserved as the visual starting point. The rebuild stops after the first editorial handoff; later archive rooms retain their compositions.

Current organization adds dedicated About, Work, Journal, Gallery, Links and Guestbook routes without changing that opening. The homepage retains its first paper composition as a short introduction, then two selected Vault chapters, Now / Lately and the closing. Inner pages use a warm paper shell, readable editorial headlines, unequal image mounts and divided indexes rather than a repeated card grid. `universe.css` supplies public-only route integration; `/admin` retains its styles. See `ROUTES_AND_CONTENT.md` for the content contracts and route map.

## Type and surfaces

Self-hosted Newsreader supplies a lighter, optically sized display/reading face with a true italic. DM Sans provides navigation, readable biography, controls and technical context. Small monospace labels are subordinate. The previous wide, heavy Syne display treatment is no longer loaded. Original font notices remain; see `FONTS.md`.

Charcoal has a muted olive cast (`#141711`), warm paper (`#efede5`) carries the personal spread/index, and sage paper (`#d7d9cd`) marks visitor correspondence. Writing has a restrained oxblood surface (`#392c2c`); the gallery uses soft stone. Project accents are localized to original artwork. Large serif type and carefully set smaller sans text replace the repetition of uniformly enormous technical headings. No full-screen glowing gradients, glass panels or repeated pill system is used.

`globals.css` retains shared base, form, admin, exhibition and accessibility rules. `archive.css` supplies public archive compositions; `worlds-theme.css` follows it with narrowly scoped `.reference-home` integration. `hero-worlds.module.css` contains the prototype-derived opening and first editorial geometry. Preserve import order and verify production CSS when changing it. Private dashboard layouts retain their existing controls.

The opening deliberately retains the prototype’s Arial/Helvetica display typography and Georgia paper typography, with blue-black `#0b1015`, bone `#f0eee8`, acid lime `#c5fb57` and cyan `#42e7e1`. No additional font download is needed. Software is blue, writing bone, the visual world green and the portrait reservation violet. The large name is the real person; the smaller navigation/footer brand remains the centrally configured `default`. Newsreader and DM Sans remain in the later archive rooms.

## Composition

- Opening: four colored worlds under the full name, spreading into one large blue SAT’chi scene before the diagonal paper wipe. Every world links into the actual archive. Concept previews are explicitly labeled; no app statistics or fabricated screenshots are shown.
- Presence: a large “More / than code.” heading and the prototype’s overlapping yellow/blue/green editorial tiles introduce the retained biography and three honest photo reservations. Tile links lead to the personal story, writing and sketchbook. No fake likeness is supplied.
- Vault: a dark exhibition with a refined title, original concept artwork, close descriptions and stable project disclosures. SAT’chi gets a new geometric learning study; the old opening/fold motif is removed. Unknown links/stacks/statuses remain honest.
- Archive: a chronological-label index with unequal text columns, native expanded entries, category filters and visibly reserved pages. This is a collection browser, not another grid of cards.
- Writing: a quiet oxblood reading room, margin metadata and expressive but readable lines. The specimen is clearly identified as a replaceable sample rather than the owner's published writing.
- Visual notebook: three uneven original studies, large editorial mounts and museum-like captions. It supports real drawings, photos and sketches through the same image model.
- Parallel interests and milestones: subdued paper/ink compositions and truthful records; numbers never act as invented counters.
- Guestbook and ending: an open correspondence spread, approved visitor entries, and a direct private-note action in the closing section. The floating trigger and secure forms remain available.

## Responsive/accessibility boundaries

At 800px the four opening worlds become a two-by-two composition and the featured project separates copy from artwork vertically. The following editorial spread stacks while retaining its rotated tile composition. Existing 700px archive/biography/gallery layouts remain in place. Focus, skip link, native disclosures, textual image labels and reduced motion remain supported. Covered opening and desktop exhibition controls remain inert and aria-hidden. Reduced motion and failed/no JavaScript enhancement leave a single readable opening without a long empty scroll range. See `MOTION_ARCHITECTURE.md` for animation ownership and `ARCHIVE_CONTENT.md` for content editing.

## Room motion and the shared grid

Public navigation and inner content share `--public-gutter`; the header keeps identical desktop brand/location slots across rooms. Intentional internal editorial offsets remain. `room-motion.css` layers folio transitions, framed biography images, ruled literary margins, exhibition responses, a native gallery viewer and directory highlights after existing public styles. Dark/paper focus colors remain visible. The footer’s “One last detail” reveals the centrally configured `Simply Lovely` Easter egg. See `CREATIVE_MOTION_VALIDATION.md` for measurements and actual browser evidence.

## Signature inner scenes

Work, Gallery and About now open with compact editorial mastheads so their actual media composition appears in the first viewport. `signature.module.css` owns the new scoped exhibition, collage and biography frames. Work uses a localized cobalt stage with lime/charcoal concept art, Gallery develops from dark stone to a paper contact sheet, and About combines reserved violet/sage/ochre frames before its milestone handoff. These surfaces extend the existing four-world identity; homepage source remains unchanged.

Each signature sequence has one GSAP progress clock inside native sticky layout, with a 300ms scrub settle for wheel input and independently transformed media/typography. Below 800px, below 600px height, reduced motion and no-JavaScript render normal responsive compositions. Long reading sections and forms remain in document flow. Neutral Gallery reservations live alongside the existing media data in `src/data/archive.ts`; real album images replace them without changing animation code. See `SIGNATURE_MOTION.md`, `SIGNATURE_REFERENCES.md` and `SIGNATURE_VALIDATION.md` for ownership, licensing and measured evidence.

## Work / Gallery proof — 18 October 2026

This scoped proof supersedes earlier Work/Gallery palette and timing descriptions above; it does not restyle the homepage or admin. `editorial-system.module.css` owns role tokens (`--bg`, `--fg`, `--accent`, `--muted`, `--line`), the existing shared gutter alias, a 65ch measure, fluid display scale, editorial/energetic easing, and 12/8/4 column counts. DM Sans remains the structural face, Newsreader italic the single expressive counterpoint. No additional font is loaded. Ink and Paper are applied on the two routes; Ultramarine is a named available variant, used as localized artwork colour rather than another full scene.

Work: a smaller route masthead gives the project poster priority. Its native sticky sequence is 280svh (previously 340); original SAT’chi and Huquq geometry and two-exhibit navigation remain. The title and art exchange sides, with plain case-study links visible from the start. Provenance has its own unscaled 14px layer. Mobile moves description/action ahead of the 4:3 project artwork so the first viewport gives both orientation and an action. Complete Notes, project identifiers and collaboration data are retained.

Gallery: when every published album is marked `siteArtwork`, render `StudyPlate`, a still paper composition: one 4:5 lead study, two unequal previews, explicit provenance, and a collection link. It uses natural media ratios; all three mounts link to the existing album. No 300svh stage for an archive without photographs. `room-timelines.ts` excludes this plate from generic media masks/parallax, keeping mobile and first-view art visible. The existing photo-capable Gallery scene and native album viewer remain for future personal media. No pinch/zoom support is claimed.

See `design-research/DISCOVERY.md`, `REFERENCE_LEDGER.md`, and `CHECKPOINT.md` for direction comparisons, measured bounds, recordings, regression results and missing owner assets. The previous font/colour material for other rooms remains unchanged pending review.
