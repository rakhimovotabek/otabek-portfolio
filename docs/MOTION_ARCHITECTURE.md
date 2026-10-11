# Personal archive motion — Phase 5

## Ownership and lifecycle

Native scrolling remains authoritative. `PageMotion` enhances readable server-rendered children after local fonts and dynamic GSAP/ScrollTrigger imports resolve. Scoped `gsap.matchMedia` contexts initialize/revert the opening and editorial modules; `VaultMotion` retains its separate exhibition/list lifecycle. Context teardown and asynchronous disposal guards support development Strict Mode and preference/viewport changes. No new animation dependency, smooth-scroll layer, WebGL or loading gate is added.

GSAP owns section/artwork transforms and masks. Motion for React owns contact-button transforms and dialog entry. CSS owns small link/disclosure feedback. Entrance masks and scroll transforms target different nested layers; no two engines compete for a transform. Pointer events are cleaned up; pointer bounds are measured on entry instead of every movement.

The existing debounced `useDiscussionLayout` observer also serves the archive index. Disclosure/filter height changes refresh current ScrollTrigger measurements once after settling. Reduced motion skips this work. Archive filtering does not replace server content or move scroll on every frame.

## Choreography

- **Opening:** a 1.5-second rising image mask, a staggered paper-edge detail, a signature revealed from its lower edge, then the smaller two-line invitation and identity. All controls/content are rendered before enhancement. The artwork travels farther than the signature during scrolling; mobile uses shorter distances and a tighter static crop.
- **Presence:** rounded paper boundary, a vertical headline reveal, different directional image masks and a small internal image-depth pass. Biography paragraphs move only at entry, then stay still for reading. Captions do not travel independently of their figures.
- **Vault:** the original 82svh stage and five native-scroll chapters remain on wide/tall desktops. A 4.5-viewport scroll range allocates 64% of each chapter to reading and 36% to handoff. Artwork eases from a close framing during each hold. Outgoing panels lift/recede while incoming artwork uncovers upward and the project title opens separately. A thin progress rule tracks the timeline without React state. Covered layers remain inert/pointer-disabled/aria-hidden; chapter anchors and list escape remain functional.
- **Vault → Archive:** the collection closes on an editorial line, and a rule opens across the warm-paper index. The index stays a natural-scroll reading surface, without an additional long pin.
- **Writing:** the oxblood room has different pacing: a quiet title shift, then staggered masked lines in a wide reading column. Paragraphs remain static. No pinned text, kinetic word-by-word distraction or artificial scrolling deadline is used.
- **Visual notebook:** alternating image masks, small internal depth and unequal mounts create a measured gallery rhythm. SVG geometry uses simple paths and locally lit paper surfaces rather than expensive blur/shadow animation.
- **Parallel interests / milestones:** varied card travel and restrained inner pointer response preserve the collage. Real rank/band values reveal along drawn rules; values never count or change.
- **Guestbook / ending:** visitor heading opens before correspondence, the final heading uncovers horizontally, and the signature rises into place. The footer private-note action opens the existing native modal through a scoped event listener, with native focus restoration. Floating contact remains available during pins.

## Responsive and accessible states

Below 1100px or 760px viewport height, the Vault uses the existing natural-scroll presentation. Phones receive shorter artwork travel, single-column reading, compact archive metadata and staggered gallery mounts. The desktop pin is the only long exhibition pin; nothing traps native scroll or requires hover.

Reduced motion disables pins, parallax, large reveals and pointer decoration. GSAP reversion restores all panels, masks, transforms and interactions. CSS disables smooth scrolling and decorative transitions. All meaningful content is readable without animation initialization. With JavaScript disabled, navigation and archive/project native disclosures remain available, all entries show, and forms require JavaScript with accurate notices. Submitted/pending/private content behavior remains governed by the Phase 4B backend, not motion.

## Performance and validation

Transforms, opacity, simple inset masks and thin transformed rules carry the motion. No animated filters, layout dimensions, cursor tracker, permanent `will-change`, full-screen raster effects or new runtime packages were added. Newsreader's two official Latin WOFF2 files total 278,872 bytes; Syne is no longer loaded. Frames reserve their image ratios before real assets arrive.

See `PHASE_5_VALIDATION.md` for actual Chromium checks and measured observations. Headless local measurements cannot guarantee frame rates on all devices. Real assets should remain optimized; oversized uploads can harm performance even when the animation architecture is lightweight.
