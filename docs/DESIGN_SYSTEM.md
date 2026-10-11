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
