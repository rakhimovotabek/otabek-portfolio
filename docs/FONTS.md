# Font provenance

Two unmodified variable font files from the official Google Fonts repository are distributed with their original license notices:

| Font    | Source                                               | License notice                  |
| ------- | ---------------------------------------------------- | ------------------------------- |
| Syne    | https://github.com/google/fonts/tree/main/ofl/syne   | `src/app/fonts/Syne-OFL.txt`    |
| DM Sans | https://github.com/google/fonts/tree/main/ofl/dmsans | `src/app/fonts/DM-Sans-OFL.txt` |

Both notices specify SIL Open Font License, Version 1.1, which permits embedding and redistribution with the notices. The original upstream file names were `Syne[wght].ttf` and `DMSans[opsz,wght].ttf`; only their filenames were simplified, not their contents. Original authors/copyright are in the retained notices. Files were downloaded on 2026-10-11. The combined font binary size is 387,144 bytes. `next/font/local` handles same-origin delivery, preload and fallback metrics. No remote font fetch occurs during a build or page visit.

Georgia and monospace are system fallbacks; no files for those fonts are redistributed. Original CSS/SVG illustration source was written for this portfolio. No reference-site media is used.

## Phase 5 reading/display upgrade

Newsreader is redistributed under its original SIL OFL 1.1 notice at `src/app/fonts/Newsreader-OFL.txt`; copyright belongs to The Newsreader Project Authors. [Official source](https://github.com/google/fonts/tree/main/ofl/newsreader). Official Latin variable WOFF2 normal (132,000 bytes) and italic (146,872 bytes) subsets were obtained from Google's font delivery service on 2026-10-11 using the CSS2 family request `Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800`. No custom outline edits or bitmap-generated type are used. The normal and true italic support weights 200–800 and optical sizing. Their font files are self-hosted through `next/font/local`, with no external visitor font requests.

DM Sans remains the sans serif. Syne's original files/notices remain in the repository for provenance but are no longer imported/preloaded, so its wide display treatment and browser payload are removed. The editorial CSS falls back to Georgia for characters beyond the included Latin coverage.
