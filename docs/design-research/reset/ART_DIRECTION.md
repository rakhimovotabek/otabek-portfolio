# Work + Gallery reset

Baseline: `f5dac8b`. The previous production captures are reused unchanged in `before/`; their recorded viewport and scroll positions are retained. New captures go into `after/`. Coordinate comparisons and semantic scene comparisons are identified separately because the page lengths and compositions changed.

## Decisions visible in the implementation

- **SAT’chi:** full-bleed ultramarine typographic poster. The oversized name is a background layer, not a heading in a copy column. A cream subject/answer study and citron journey fragment expand into a study desk. Subject names and journey vocabulary come from the owner’s public SAT’chi source/landing page. No scores, analytics, user counts or invented product capabilities. These are expressly labeled portfolio interpretations, not screenshots. Genuine captures remain on the case-study route.
- **Huquq Test:** an examination folio on warm paper, plum typography, a pink backing sheet and an illustrated numbered-question leaf. The room arrives horizontally, then the sheets separate. The question navigator and Yangiariq identity informed the artwork. No copied exam questions or personal data.
- **Archive:** a dark cabinet with compact featured entries, unequal typographic poster thumbnails for the other three projects, large titles and native Notes disclosures. All five identifiers, routes and collaboration/contribution actions remain.
- **Ending:** a paper invitation with separated correspondence/contribution actions. The former ultramarine CTA block is removed.
- **Gallery:** a centered, oversized aperture under a full-width typographic overprint. It opens into an image field, then breaks into an unequal contact sheet on paper. The three original prints are new vector studies, explicitly identified as site artwork. Existing personal/archive studies elsewhere are unchanged.
- **Opening a print:** directly from the Gallery scene, the actual crop expands and unfolds into a light viewing table. Its target bounds use the selected image’s aspect ratio. Native dialog, keyboard arrows, swipe, Escape, focus restoration and the standalone album route remain available. No-JS visitors can enter the album through its normal link.

## References → concrete decisions

- [Strade](https://www.strade.tech/), inspected through the saved local opening/scroll material: typography crossing exhibit boundaries; poster-to-focus sequencing; a full-room handoff. Applied to SAT’s expanding study desk and Huquq’s horizontal folio entrance. No reference assets or source redistributed.
- [BeanTab](https://beantab.uz/), local saved page and captures: differentiated product emphasis and tactile action treatment. Applied to the marked answer option, angled paper fragments, thumbnail straightening and the compact arrow treatment. Its gold/black styling is not copied.
- [21st / Systaliko scroll-animation family](https://21st.dev/@youcefbnm/components/hero-gallery-scroll-animation), previously inspected source with its retained MIT notice: one progress clock with independently transformed media. The reset uses the existing native-sticky GSAP owner; no new motion dependency or copied demo imagery.
- [Folitox](https://folitox.com/), current public template catalogue (including its print/Swatchbook and spatial presentation examples): treating a portfolio exhibit as a designed object. Applied as subject sheets, examination folios and original graphic prints, rather than dashboard screenshots.
- GetLayers and dqnamo Kitchen were requested direction references, but their current pages were unavailable through the browsing tool. No claim is made that their current code or visual implementation was inspected or copied. The authored exhibit and direct print-opening decisions above implement the requested principles without borrowing their assets.

## Original assets

`product-exhibit.tsx` + its CSS: SAT study/journey composition and Huquq examination folio. The contents are non-interactive portfolio artwork; links open the real case studies.

`public/images/studies/interval.svg`: ribbon/contour print. `counterform.svg`: letter/counter-space print. `intersection.svg`: interrupted striped diamond print. All three were drawn in repository-native SVG for this checkpoint; no stock, generated personal photos, third-party code or licensed reference graphics. Media records live in `src/data/archive.ts`. The `site-studies` album route and existing image identifiers are preserved.

Personal photographs remain unavailable. This is a demonstration exhibition that accepts future photographs through the existing media/album contract. No CMS, database, auth, chat or deployment work.
