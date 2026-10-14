# Work — visual direction checkpoint

Scope: `/work` only, following `97c1466`. No other page is redesigned. No new library, font, image, project fact, database/security change or deployment.

## Diagnosis from the original rendering

The opening had four category filters, a route description, an exhibition introduction and repeated index links before the project. Project titles appeared again inside the artwork. Cobalt, navy and lime competed within SAT’chi; the muted green/grey second scene weakened the contrast. The directory repeated the same large-artwork/paragraph/actions arrangement for five entries, including the two projects already exhibited. The movement was substantial but the composition remained a familiar image-and-copy split.

## Composition and visual system

- **Opening:** a compact “Selected work.” masthead on near-black. Filters move into the archive where they act. The first exhibit appears on arrival.
- **SAT’chi:** the existing original line drawing fills a large ultramarine field. A single oversized mixed sans/italic title crosses its edge. The same existing progress timeline moves the artwork left and resolves the title and short sentence on the right. Secondary slogans and the duplicate artwork title are hidden on this route only.
- **Huquq Test:** warm paper receives the handoff; the original balance drawing sits on black. Its narrower, lower frame and taller two-line title distinguish the composition from SAT’chi. Title and panel positioning were refined after inspecting actual scrolling, to prevent dark-on-dark overlap.
- **Index:** five title-led rows, with discipline in the margin, one project link, and a native Notes disclosure. All full descriptions and applicable collaboration/contribution actions remain there. Physical and creative filters keep their honest empty states. Curated exhibits stay above the filtered index.
- **Ending:** “Next, together.” and the real SAT’chi collaboration action, plus the verified GitHub profile. The existing global correspondence footer remains below.

Palette: `#111114` ink, `#F2EFE7` paper, `#284BFF` ultramarine. Vermilion `#F15A38` is restricted to the closing arrows. Acid lime is not used. There are no new gradients, glow effects, shadows or decorative layers.

Typography: existing self-hosted DM Sans for the large sans shapes and index; Newsreader italic for the title inflections; existing mono labels for subordinate metadata. No font download. At 1366px SAT’chi is about 287px before the existing 0.5 title scale; the index is about 37px. The deliberately large exhibit type contrasts with the quiet metadata and single 16px project action.

## Copy measurement

Whitespace-delimited words, excluding titles, captions and navigation:

- Two exhibit descriptions: **29 → 11 words**, a **62.1% reduction**.
- Default paragraph copy across the Work page: **115 → 11 words**, a **90.4% reduction**, because the directory's descriptions now require opening Notes.
- All five full descriptions remain unchanged and readable in native disclosures and the existing detail pages. These counts measure default presentation, not deleted information.

Raw original paragraphs and scroll positions: `preview/work-direction/before/measurements.json`. Final counts and retained descriptions: `preview/work-direction/after/results.json`.

## References and skills

Applied the installed `ui-design`, `ui-animation` and `ui-verification` instructions directly: existing design system, aesthetic restraint, typography/colors/section layout/responsive guidelines; motion decision/scroll guidance; browser session, axe, viewport and focus probes. The user's explicit palette and Work-only scope define this checkpoint.

Revisited [21st Systaliko Hero Gallery Scroll Animation](https://21st.dev/@youcefbnm/components/hero-gallery-scroll-animation) for media-led scale relationships and [Full Screen Scroll FX](https://21st.dev/@lovesickfromthe6ix/components/full-screen-scroll-fx) for restrained exhibit chrome and shared-stage composition. The previously adapted MIT technique and notice remain in `SIGNATURE_REFERENCES.md` and `licenses/Systaliko-MIT.txt`. No additional third-party source or artwork is copied. Full Screen Scroll FX remains visual/usage reference only because its listing does not establish a clear license.

The owner’s homepage motion contact sheet and original prototype inform dark/paper contrast and large type. [Strade](https://www.strade.tech/) was revisited as a visual reference. Its proprietary graphics and saved source are not redistributed. Existing `ProjectArt` SVG paths are reused rather than inventing application screenshots.

## Evidence and reproduction

Original screenshots captured before editing at **1366×900** and **390×844**:

- `preview/work-direction/before/{width}-opening.png`
- `preview/work-direction/before/{width}-scroll-600.png`
- desktop `start`, `featured` (27%), `transition` (47%), `second` (77%), `final` (100%), `archive`, `ending`
- mobile `featured`, `second`, `archive`, `ending`

Final equivalent captures are in `preview/work-direction/after/`, plus 320px / 1024px, disclosure-open, reverse, reduced-motion and no-JavaScript evidence. The 600px comparison uses the same absolute scroll position; named scene states use equivalent progress or section alignment, because the opening and directory have different heights. `results.json` records actual scroll coordinates. Before the redesign there was no dedicated project-collaboration ending; its baseline shows the existing correspondence footer.

Actual wheel-scroll recording, forward and backward, followed by the archive and ending: `preview/work-direction/after/recordings/work-direction.webm`. It uses a 1366×900 viewport, recorded at 910×600. The screenshot sequence and the extracted recording contact sheet were inspected visually.

Focused browser command (tooling external to the application):

```sh
NODE_PATH=/tmp/otabek-browser-qa/node_modules \
PLAYWRIGHT_CHROMIUM_PATH=/home/otabek/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
node scripts/check-work-direction.cjs
```

Final TypeScript, ESLint and `npm run build -- --webpack`: **passed**. The final focused browser run: **passed**, with zero runtime errors and zero violations in four scoped axe scans (SAT’chi, Huquq Test, archive and ending). Browser checks cover composition states, reverse bounds, exhibit selection, all five project URLs, native Notes keyboard operation, category query changes, exact archive history restoration, actual contact-dialog project context and focus return, project comments mounting, homepage focus phase and navigation back to Work. The raw axe output retains incomplete checks; zero violations does not imply every check ran.

The first production probe caught a harness timing assumption: it asserted inert state before the existing scrub settled after a rapid jump. The probe now waits for the rendered active state. Screenshot inspection subsequently caught an off-canvas mobile Huquq frame that parent overflow clipping concealed from a document-overflow test. The CSS specificity was corrected, and the clearing probe checks artwork bounds directly in static layouts.

## Boundaries and remaining weaknesses

- The artwork is still abstract concept art, explicitly labeled. Real application screenshots are not available; this pass does not fabricate them.
- The existing 340svh Work sequence and 300ms scrub settle remain. Native sticky, cleanup, reduced-motion/mobile/no-JavaScript alternatives and route transitions are preserved. The only shared engine change avoids empty label/copy tweens after removing that markup.
- The original global correspondence footer follows the project-specific ending. It is preserved rather than changing navigation/contact behavior outside this page.
- Below 800px or 600px height, reduced motion and no JavaScript use static compositions. Mobile does not reproduce desktop scroll choreography.
- No physical device, Safari or screen-reader session; no new performance benchmark, broad failure-injection matrix, live message submission or authenticated MFA session. Backend/auth source is unchanged. The focused browser run verifies reachable UI behavior, not hosted delivery or signed-in administration.
- This is a design checkpoint for the owner's visual judgment. Gallery, About, Journal, Links and Guestbook remain at their previous design.
