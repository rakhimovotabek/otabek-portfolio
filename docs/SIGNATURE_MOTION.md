# Inner-page motion ownership

The homepage and its four-world timeline are unchanged. New scene markup comes from server components; `ScrollScene` enhances the existing document with the existing GSAP dependency. No runtime dependency was added.

## Scenes

| Scene | Scroll travel | Main stages |
|---|---|---|
| Work | 240svh after a 100svh native sticky stage | Large SAT’chi image → angled left mount and right details → stone Huquq exhibit replaces blue stage → second mounted detail |
| Gallery | 200svh | Uneven five-frame collage → central image scales to 2.5× as surrounding images recede → images align at 0.64× in a contact sheet and the surface changes to paper |
| About | 180svh | Three layered portrait reservations → independent spread to the left, second biography chapter revealed through a mask → frames flatten into a smaller stack beside the milestone heading → actual achievements |

The signature rooms now use a compact masthead so the composition appears in the first viewport. This corrects the first implementation, which left the previous large heading in place and pushed the entire visual experience below the fold. Before captures remain unchanged for comparison.

Timeline windows are expressed in normalized scroll progress. All timeline tweens have `ease: none`. A 300ms ScrollTrigger scrub settle softens stepped wheel input; this is deliberately different from the skill's direct-manipulation default and follows the owner's explicit smooth-motion preference. Screenshots and reverse comparisons wait 550ms for this settle. Motion is not curve-fitted to the external references.

## Lifecycle and history

- Each `ScrollScene` creates one scoped matchMedia context and one ScrollTrigger timeline. No GSAP pin spacers, wheel interception, Lenis, WebGL, or animation loop is added.
- `useLayoutEffect` reserves the enhanced document length before history scroll restoration. Without this, a returning Work page could briefly have its shorter server layout, clamp the saved scroll position, and return 170px above the previous position. The reservation is client-only and gated by the same width/height/motion query; imports failing remove it.
- Async setup checks disposal. Context reversion removes tweens, inline styles and triggers. Explicit cleanup removes exhibit button handlers, inert attributes and enhancement classes.
- Older `roomTimelines` media reveals exclude `[data-signature]`. `FilterScene` targets only the ordinary project directory. Gallery viewer transforms stay inside its own dialog; no shared transform owner.
- Exhibition interaction follows the rendered timeline progress. Covered exhibits are inert and aria-hidden. Jump controls, skip links and the complete project directory remain accessible.
- Gallery frames that leave the viewport during the zoom become inert. All frames return to keyboard navigation for the contact sheet. Captions have an independent feature treatment rather than scaling huge with the central image.
- Prose below the signature scenes remains normal document flow. Existing biography and verified records are preserved. About's achievements immediately follow the cinematic handoff.

## Responsive / content contracts

Below 800px, below 600px height, and under reduced motion, all scenes render as ordinary responsive compositions. No-JavaScript HTML stays readable and linked, without a long empty sticky range. Mobile currently gets a static collage/stack/exhibition alternative, not the desktop choreography.

`ArchiveMedia` and published `GalleryAlbum.images` provide real future images. The first five published images become collage frames; clearly labeled reservations fill the available remaining slots. Existing Next Image sizing, dimensions, alt text, credits and album viewer are retained. No upload backend was introduced.

Journal has no published entries. Its honest empty state becomes a native folding folio; there is no fictional article or claim of a verified article-opening sequence. Links uses native profile-address disclosures and real clipboard feedback. Guestbook draws only its note margins on entry; text and form controls are never animated away.

The biography masks use explicit percentages on every inset edge in both states. Mixing a percentage start with unitless end edges produced invalid intermediate CSS and a reveal that snapped at completion. Browser inspection at 75% now asserts a genuinely intermediate mask, full text opacity, and an inert milestone link until the mask completes. Gallery interaction also follows rendered timeline progress during scrub settling.
