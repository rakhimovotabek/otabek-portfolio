# Editing the personal archive

For the current multi-page site, see `ROUTES_AND_CONTENT.md`. Published journal entries, albums, collaboration settings, public links and Now / Lately are configured in `src/data/universe.ts`. The earlier sample writing and reserved archive entries below are retained source material, not published personal journal entries. Existing portraits and visual studies still supply the new routes.

Phase 5 treats the site as a collection of a person, selected software, words and images. It uses repository data, not a CMS. Existing project IDs and Supabase comment targets are unchanged.

## Content map

| Content                                                                        | Source                                           |
| ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Temporary nickname, metadata title, navigation, opening and contact copy       | `src/data/site.ts`                               |
| Real name, country, biography, interests, verified achievements and projects   | `src/data/portfolio.ts`                          |
| Presence headings, three photo slots, archive entries, writing, visual studies | `src/data/archive.ts`                            |
| Four-world opening, featured-project reference and first editorial spread      | `src/data/hero.ts`                               |
| Optional verified social profiles                                              | `profile.socialLinks` in `src/data/portfolio.ts` |
| Server credentials/protection and connection                                   | Ignored `.env.local`; see `SUPABASE_SETUP.md`    |

Change only `site.brand` to replace the nickname throughout the site. Do not alter project IDs casually: they are database foreign keys and existing comment targets. Unknown stacks, dates, links and statuses remain null; they are never inferred.

The reference-driven opening links its four worlds to the existing Software, Writing, Sketchbook and About sections. Its project focus derives from `projects[0]`, preserving SAT’chi’s canonical ID and description. `presence.portraits[0].src` supplies both the hero portrait world and the first editorial portrait tile; `visualStudies[0].src` supplies the visual world. Their null states remain explicitly reserved or original site artwork. Adding a verified `projects[0].image` replaces the featured concept device with the real screenshot. No extra image files or duplicate personal records are required.

## Photographs and drawings

Place selected, licensed images in `public/archive/`. Update the corresponding `ArchiveMedia` record:

```ts
{
  id: "portrait-main",
  src: "/archive/portrait.webp",
  alt: "A concise, accurate description of the photograph",
  caption: "Your own caption",
  width: 900,
  height: 1200,
  placeholderLabel: "",
  credit: "Photographer / permission or license, if applicable",
}
```

The three presence slots support a main portrait, a landscape secondary image and a small detail. Null sources render explicit reservations, never generated portraits. Use the image's actual width/height; the frame reserves its aspect ratio before loading. `MediaFrame` uses Next Image with fill and responsive sizes, and image sources should be local by default. New remote origins need a narrow reviewed image allowlist; do not allow arbitrary hosts. Strip private EXIF/location data and optimize images before adding them. This is a personal-content editing step, not a public upload feature.

The geometric SVG studies are original website artwork, clearly credited as such. They do not claim to be Otabek's drawings, photographs, or product screenshots. Replace a study with your image source and remove its `study` value/credit when appropriate. No stock image or reference-site asset is used.

## Archive and writing

`ArchiveEntry` supports stable ID, category, optional year, description, preview, excerpt, external link and status. Categories include essays, notes, poems, drawings, sketches, photographs, talks, visual experiments and other works. The archive is a disclosure index; All/Words/Images filtering enhances it with JavaScript. Without JavaScript, every native disclosure remains available.

Reserved entries have `status: "placeholder"`; never label them published until a real work exists. Site studies use `site-study`. Real entries may be published or drafts, with their actual year. Status is a public label, not a privacy control: everything in these data files is public content. Keep private drafts outside the application. All displayed text is rendered as React text; no raw HTML is needed.

`WritingEntry` provides a title, category, optional year, excerpt and paragraph array. The existing specimen is deliberately `status: "sample"` with a visible “not personal writing” label. Replace it with your actual text and set `status: "published"`. Multiple entries are supported. Poetry line breaks in excerpts are preserved; paragraphs remain static while being read. There are no invented poems, autobiographical notes, awards or publishing dates.

## What still needs Otabek's material

- One main portrait, one place photograph and one detail photograph, with accurate captions/credits.
- Original writing, poems, notes or essays to replace the marked reading specimen and reserved entries.
- Personal drawings, sketches or photographs to replace/supplement the site studies.
- Verified project screenshots, stacks, statuses and external links.
- Verified social links if desired. No profile was guessed.
