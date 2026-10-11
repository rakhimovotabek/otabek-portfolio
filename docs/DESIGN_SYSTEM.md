# Personal archive design system — Phase 5

The site is an editorial collection: presence, selected software, an archive index, a reading room, a visual notebook, parallel interests, milestones, visitors and correspondence. Earlier forms and security behavior are preserved. There are no fabricated personal artworks, photographs, project screenshots, metrics or social profiles.

## Type and surfaces

Self-hosted Newsreader supplies a lighter, optically sized display/reading face with a true italic. DM Sans provides navigation, readable biography, controls and technical context. Small monospace labels are subordinate. The previous wide, heavy Syne display treatment is no longer loaded. Original font notices remain; see `FONTS.md`.

Charcoal has a muted olive cast (`#141711`), warm paper (`#efede5`) carries the personal spread/index, and sage paper (`#d7d9cd`) marks visitor correspondence. Writing has a restrained oxblood surface (`#392c2c`); the gallery uses soft stone. Project accents are localized to original artwork. Large serif type and carefully set smaller sans text replace the repetition of uniformly enormous technical headings. No full-screen glowing gradients, glass panels or repeated pill system is used.

`globals.css` retains shared base, form, admin, exhibition and accessibility rules. `archive.css` supplies the revised public compositions, tokens and compact layouts, imported afterward through the root layout. Preserve that import order; verify production CSS when changing it. Public selectors are scoped to their sections; private dashboard layouts retain their existing controls.

## Composition

- Opening: a tall original paper-volume study intersects a restrained lower-case signature. The person, role and location remain explicit. Negative space separates the artwork from the invitation to explore.
- Presence: main portrait reservation, offset landscape reservation, substantial biography and a smaller detail image beside the reflective afterword. Replaceable frames state that photographs are absent; no fake likeness is supplied.
- Vault: a dark exhibition with a refined title, original concept artwork, close descriptions and stable project disclosures. SAT’chi gets a new geometric learning study; the old opening/fold motif is removed. Unknown links/stacks/statuses remain honest.
- Archive: a chronological-label index with unequal text columns, native expanded entries, category filters and visibly reserved pages. This is a collection browser, not another grid of cards.
- Writing: a quiet oxblood reading room, margin metadata and expressive but readable lines. The specimen is clearly identified as a replaceable sample rather than the owner's published writing.
- Visual notebook: three uneven original studies, large editorial mounts and museum-like captions. It supports real drawings, photos and sketches through the same image model.
- Parallel interests and milestones: subdued paper/ink compositions and truthful records; numbers never act as invented counters.
- Guestbook and ending: an open correspondence spread, approved visitor entries, and a direct private-note action in the closing section. The floating trigger and secure forms remain available.

## Responsive/accessibility boundaries

At 700px the opening becomes a purpose-built vertical cover, presence images overlap within reserved space, archive metadata wraps into a compact index, and gallery mounts stagger down one natural-scroll column. Minimum controls remain 44px. Focus, skip link, native disclosures, textual image labels and reduced motion remain supported. Covered desktop exhibition panels remain inert and aria-hidden. See `MOTION_ARCHITECTURE.md` for animation ownership and `ARCHIVE_CONTENT.md` for content editing.
