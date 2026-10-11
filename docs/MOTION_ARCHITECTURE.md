# Personal archive motion

## Ownership and lifecycle

Current route organization: `PublicShell` persists the community provider/contact launcher and keys `PageMotion` by pathname. Each public page gets a fresh scoped context; the previous page's ScrollTriggers and DOM states revert. The opening timeline is retained. Inner page titles receive a short masked rise, and shared media frames retain their existing reveals. The homepage Vault now selects two works while keeping the same .64 reading hold/.36 handoff per chapter; its native-scroll range is .9 viewport per selected chapter. Full comments are on `/work/[slug]`. See `ROUTES_AND_CONTENT.md` for page/content boundaries.

Native scrolling remains authoritative. `PageMotion` enhances readable server-rendered children after local fonts and dynamic GSAP/ScrollTrigger imports resolve. Scoped `gsap.matchMedia` contexts initialize/revert the opening and editorial modules; `VaultMotion` retains its separate exhibition/list lifecycle. Context teardown and asynchronous disposal guards support development Strict Mode and preference/viewport changes. No new animation dependency, smooth-scroll layer, WebGL or loading gate is added.

GSAP owns section/artwork transforms and masks. Motion for React owns contact-button transforms and dialog entry. CSS owns small link/disclosure feedback. Entrance masks and scroll transforms target different nested layers; no two engines compete for a transform. Pointer events are cleaned up; pointer bounds are measured on entry instead of every movement.

The existing debounced `useDiscussionLayout` observer also serves the archive index. Disclosure/filter height changes refresh current ScrollTrigger measurements once after settling. Reduced motion skips this work. Archive filtering does not replace server content or move scroll on every frame.

## Choreography

- **Reference opening:** `hero-timeline.ts` translates Otabek’s prototype’s normalized scroll math into one reversible GSAP timeline. Four colored worlds sit under individually staggered name characters. Inner character spans own the one-second entrance; their outer spans own scroll departure. From progress .07–.23 the heading recedes; .22–.51 spreads the worlds and reveals the SAT’chi scene through a horizontal inset mask. Its original concept device settles in perspective while copy enters separately. From .72–.96 a scaled, seven-degree paper plane carrying orange/blue/lime rules crosses the viewport. The final .04 holds the paper. A transformed rule tracks progress without React state.
- **Opening → Presence:** the next paper section overlaps the journey’s end by 28svh on desktop and 18svh on mobile, avoiding a dead interval between the wipe and real editorial content. A headline mask and three differently paced tile wrappers continue the composition; inner tiles independently own CSS hover feedback. Biography frames and paragraphs retain the existing restrained entry treatments. Captions stay with their figures.
- **Vault:** the original 82svh stage now presents two curated homepage chapters on wide/tall desktops, with .9 viewport of native scroll per chapter. Each chapter still allocates 64% to reading and 36% to handoff. Artwork eases from a close framing during each hold. Outgoing panels lift/recede while incoming artwork uncovers upward and the project title opens separately. A thin progress rule tracks the timeline without React state. Covered layers remain inert/pointer-disabled/aria-hidden; chapter anchors and list escape remain functional. All five canonical works and full comments are accessible through Work pages.
- **Vault → Archive:** the collection closes on an editorial line, and a rule opens across the warm-paper index. The index stays a natural-scroll reading surface, without an additional long pin.
- **Writing:** the oxblood room has different pacing: a quiet title shift, then staggered masked lines in a wide reading column. Paragraphs remain static. No pinned text, kinetic word-by-word distraction or artificial scrolling deadline is used.
- **Visual notebook:** alternating image masks, small internal depth and unequal mounts create a measured gallery rhythm. SVG geometry uses simple paths and locally lit paper surfaces rather than expensive blur/shadow animation.
- **Parallel interests / milestones:** varied card travel and restrained inner pointer response preserve the collage. Real rank/band values reveal along drawn rules; values never count or change.
- **Guestbook / ending:** visitor heading opens before correspondence, the final heading uncovers horizontally, and the signature rises into place. The footer private-note action opens the existing native modal through a scoped event listener, with native focus restoration. Floating contact remains available during pins.

## Responsive and accessible states

The opening uses a native CSS sticky stage, not a GSAP pin. Only successful enhancement extends the journey from one viewport to 360svh; phones use 290svh, two-by-two worlds, shorter transforms, lighter perspective and project copy above the artwork. Its end is measured from journey height minus stage height and refreshed by the existing GSAP lifecycle. The first transition can be reversed without scroll locking or inserting a pin spacer.

At opening progress .38 the covered world links become inert/aria-hidden and the project link becomes available; at .83 the wipe hides both. Changing accessibility state happens only at phase boundaries. If a focused control is being covered, focus moves to the navigation wordmark without moving scroll. Teardown restores the four links and the focus scene’s original hidden/inert state.

Below 1100px or 760px viewport height, the Vault uses the existing natural-scroll presentation. Phones receive shorter artwork travel, single-column reading, compact archive metadata and staggered gallery mounts. The desktop Vault pin remains the only GSAP exhibition pin; nothing traps native scroll or requires hover.

Reduced motion disables pins, parallax, large reveals and pointer decoration. GSAP reversion restores all panels, masks, transforms and interactions. CSS disables smooth scrolling and decorative transitions. All meaningful content is readable without animation initialization. With JavaScript disabled, navigation and archive/project native disclosures remain available, all entries show, and forms require JavaScript with accurate notices. Submitted/pending/private content behavior remains governed by the Phase 4B backend, not motion.

## Performance and validation

Transforms, opacity, simple inset masks and thin transformed rules carry the motion. No animated filters, layout dimensions, cursor tracker, permanent `will-change`, full-screen raster effects or new runtime packages were added. Newsreader's two official Latin WOFF2 files total 278,872 bytes; Syne is no longer loaded. Frames reserve their image ratios before real assets arrive.

See `REFERENCE_HERO_VALIDATION.md` for current prototype comparisons and `PHASE_5_VALIDATION.md` for historical archive measurements. The opening retains the owner’s static CSS lighting and geometric artwork; it omits the prototype’s always-running pointer-light loop and animated blur. It uses native scrolling and existing GSAP packages. Headless local checks cannot guarantee frame rates on all devices. Real assets should remain optimized; oversized uploads can harm performance even when the animation architecture is lightweight.
