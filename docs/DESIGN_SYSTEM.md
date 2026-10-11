# Design system

## Direction

Cinematic technical poster meets a warm editorial notebook. Oversized copy supplies the hero's visual weight; an original orbital wireframe suggests questions and interconnected ideas. The light about section provides contrast. The project index is deliberately typographic until verified project media arrives.

## Tokens

`src/app/globals.css` is the source of truth. Ink `#101114`, raised ink `#191b20`, paper `#eeeae2`. Cyan `#8ae7ff` marks the hero and links; electric blue `#3566ff` lives in orbital art; lime `#ddff96` signals the contact affordance; warm `#d09a78` marks the personal signature. Secondary text is `#a7a8ae` on dark and `#5e605e` on paper. Hairlines use surface-specific tokens.

Typography: Arial/Helvetica/system sans for clear display/body, Georgia/system serif italic for editorial emphasis, system monospace for labels. No font assets or font packages are shipped; there are no bundled font licenses to redistribute. Local system substitutions are expected across platforms.

Display and heading sizes use `clamp()`. Shared gutters are 20–80px, section spacing 64–128px. Layout adapts at 640px and 900px, with asymmetrical splits on desktop and readable stacked sections on mobile. Pill shapes are reserved for interests, status labels, and the floating button.

## Motion and accessibility

The server renders visible finished content. A client-only GSAP wrapper adds a short staggered introduction and a small ScrollTrigger orbital shift, scoped to the hero. `gsap.matchMedia` observes reduced motion and reverts on unmount/preference change. Dynamic-import failure leaves the page usable. Motion for React controls only contact-button interaction, with both MotionConfig and reduced-motion checks.

No scroll hijacking, looping animation, pinning, smooth-scroll library, or complex transitions in Phase 1. Native dialog provides focus containment, Escape dismissal and focus return. Navigation, headings, lists, labelled sections, focus rings, and skip link are semantic. Decorative art is hidden from assistive technology. Touch targets are at least 44px.

## Extension rules

Use typed central content; never add unverified claims. Extend section components and tokens rather than cloning entire layouts. Future animation must have teardown and reduced-motion alternatives. Do not turn unavailable demos into links or create fake success states. Do not use another portfolio's media or proprietary implementation.
