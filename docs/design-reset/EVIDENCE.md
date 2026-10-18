# Browser evidence ledger

## Baseline provenance

Fresh desktop baseline captures (1366 × 768, opening at scroll 0 and mid at scroll 768) were taken from `606934d` before application edits, on isolated port 3010 with backend access disabled. The initial Turbopack compile stalled; switching the preview to webpack resolved it.

The mobile capture run overlapped the first file writes and was discarded. `before/390-{home,work,gallery}.png` are the already recorded, actual 390 × 844 captures committed with the unchanged baseline `606934d`, copied from `docs/design-research/reset/after/*-opening.png`. They are reused checkpoint evidence, not falsely described as fresh captures. Supplemental desktop About/Journal/Links captures were also saved before the rewrite.

## Design decision

- [Typographic Aperture](concepts/aperture.png)
- [Signal / Field Notes](concepts/signal.png)
- [Selection criteria](DIRECTION.md)

The first Home/Work development captures exposed an inherited font-token override and out-of-view bottom strip. Corrected `*-slice.png` captures show the selected display face. Later production captures are the final authority; development screenshots retain their Next.js indicators. The first mobile Gallery viewer run was inconclusive under delayed development hydration; the production smoke run records the result independently.

## Evidence conventions

Final stills live under `after/`; motion frames and recordings under `motion/`; logs and machine-readable findings under `verification/`. Stage fractions use the real sticky interval (scene top minus 88px through scene bottom minus viewport height). Screenshots are reviewed at full rendered size. RAF intervals measure browser scheduling, not physical GPU frame rate. Headless touch and CPU throttling are simulations, not a real phone measurement.

Final production review confirmed all seven openings, both Work silhouettes, the corrected light-mat viewer controls, contact/offline form presentation, the collection table, and extracted frames from all four video clips. Supplemental desktop `*-mid.png` frames match baseline scroll 768 exactly. The About trajectory also has five captured states. The source font override, phone headline obstruction, faint status/controls and Huquq action crop were corrected from observed captures.
