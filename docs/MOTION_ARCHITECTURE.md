# Phase 3 motion architecture

## Intent and ownership

Keep the Phase 2 typography, palette, content and original artwork. The motion connects an opening folded frame, a calm editorial feature, a layered exhibition, a playful collage, factual milestones and a closing frame. No loading gate, replacement cursor, Lenis, new runtime dependency or backend is introduced. Native browser scrolling remains authoritative.

`PageMotion` is a small client boundary around server-rendered children. After local fonts and dynamic GSAP/ScrollTrigger imports are ready, it installs scoped `gsap.matchMedia` contexts. `tokens.ts` centralizes timing and media queries; `hero-timeline.ts` and `editorial-timelines.ts` define section motion. `VaultMotion` owns its own scoped exhibition and list-mode lifecycle. Motion for React exclusively owns contact-button transforms and dialog-content entry; GSAP never targets these properties. Entrance and scroll effects use separate inner/outer hero layers.

Both boundaries cancel pending frames, guard asynchronous initialization after unmount, revert their media contexts and remove custom event listeners. GSAP owns resize refreshes. The Vault requests one refresh after its geometry changes and one after switching to the reading layout; there is no refresh loop, React state on scroll or permanent will-change styling. Pointer bounds are measured on entry, with only inner decorative layers responding through reusable quickTo tweens.

## Major sequences

- **Hero:** a sub-second masked wordmark, two staggered lines, unfolding SVG frame and delayed supporting details. The page is accessible immediately. Scroll separates wordmark and frame at restrained rates, with smaller travel on compact screens.
- **Hero → About:** the warm stepped edge extends over the charcoal boundary as the editorial headline and portrait-reserved frame open. Paragraphs make a short entrance movement without fading or ongoing reading-time parallax.
- **About → Vault:** the charcoal edge grows from the opposite direction; the large title opens vertically while its second line moves horizontally.
- **Vault:** on viewports at least 1100px wide and 760px high, five original articles become overlapping exhibition layers. One 82svh stage (maximum 850px, minimum 590px) pins 9% below the viewport top over 4.5 viewport heights of native scrolling. Each of five equal chapters gives 64% of its duration to reading and 36% to a handoff: the outgoing panel shrinks and lifts, the incoming panel rises with a small alternating horizontal offset, and text/artwork settle independently. The final chapter holds its finished state. Direct scrubbing avoids a delayed timeline tugging against anchors or fast reverse input.
- **Vault → Side Quests:** the last panel releases naturally into the collection signoff; its editorial line shifts, the paper edge extends and the collage headline opens. No giant artificial empty gap or scroll lock is added.
- **Side Quests:** the existing uneven collage assembles with different travel/rotation by composition. Its star turns once with scroll. Fine-pointer interaction bends the maze, quote or lock slightly; content is always visible and no essential action depends on hover.
- **Side Quests → Achievements:** the bone edge expands and milestone rules draw as the actual rank/band typography is uncovered. Values never count up or change. Guestbook remains an explicitly disabled preview between milestones and the closing section.
- **Contact:** the midnight edge grows, the cyan folded frame settles, closing typography is uncovered and the large signature rises into place. The floating trigger settles 8px into position without hiding its label. Navigation underlines, link arrows, native mobile disclosure and contact controls receive restrained feedback.

## Accessible exhibition navigation

The stage provides five real project anchors and a “Read as list” escape. Hash links, deep links and browser hash-history changes select the matching reading hold. Modified clicks keep their native behavior. Only the currently dominant panel is interactive; every covered panel is `inert`, `aria-hidden` and pointer-disabled. If a focused outgoing panel leaves, focus moves to the incoming chapter link without scrolling. No project clones or duplicate IDs are created.

Opening project notes exits pinning and restores the original spacious exhibition, opens the selected native disclosure and preserves focus on its summary. Reading mode persists for this page visit; reloading restores the cinematic preference. All verified external URLs use the existing data-driven link markup; currently none are provided, so there are no invented live destinations.

## Responsive and reduced-motion behavior

Compact desktops, tablets and phones use the original natural-scroll layouts. Artwork reveals travel only 20px with a short clipped edge; decorative layers move 16px. No pin, overlap-driven hidden content or hover requirement exists on phones. Resizing across the cinematic breakpoint destroys/recreates the stage; preference changes remove all pins and restore all project visibility, focusability and static styles.

Reduced motion disables GSAP timelines, pointer decoration, CSS disclosure motion and Motion button travel. CSS forces automatic scrolling even if ScrollTrigger previously restored an inline smooth setting. Server HTML starts fully readable; styles do not hide content awaiting hydration. Native navigation/disclosures also work without JavaScript. The contact dialog still requires JavaScript and retains native Escape, focus containment and trigger-focus restoration. All submission previews stay disabled.

## Performance and limits

Transforms, opacity and a few simple inset masks carry the motion. No per-frame layout animation, blur/filter animation, WebGL, extra smooth-scrolling engine or new image payload is used. The section edges transform pseudo-elements through a scoped CSS custom property. ScrollTrigger handles offscreen progression without application scroll listeners.

See PHASE_3_VALIDATION.md for measured Chromium frame intervals, long tasks, heap/listener comparison, screenshots and checks. Headless local measurements are observations, not a 60 FPS guarantee or a physical-phone/GPU benchmark. Tall-text/browser zoom can use the list escape; smaller-height viewports automatically use the original reading layout. A full assistive-technology audit and profiling on physical modest laptops/phones remain useful follow-up work. No backend work is part of this phase.
