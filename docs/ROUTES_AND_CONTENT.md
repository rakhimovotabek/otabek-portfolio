# Personal universe: routes and content

The homepage is an introduction rather than the whole collection. Its five scenes are the preserved four-world opening, short paper introduction, two-project Vault, Now / Lately with collection links, and correspondence/footer. Full biography, records, work, images, writing and visitor feedback live on dedicated routes.

| Route             | Content                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`               | Preserved hero, initial diagonal/editorial handoff, selected SAT’chi/Huquq Test, Now / Lately and closing                                   |
| `/about`          | Three portrait/photo slots, biography, interests, documented Python use, education reservation and verified milestones                      |
| `/work`           | All work; server-rendered Digital, Physical / tangible and Creative category navigation                                                     |
| `/work/[slug]`    | Images/concept art, description, technologies/materials, status, verified links, related work, collaboration and canonical project comments |
| `/journal`        | Published notes, poems, essays, thoughts, experiences and photo stories; currently an honest empty state                                    |
| `/journal/[slug]` | Reading template, paragraphs/poetry line breaks, images and related gallery links; unpublished/unknown entries return not-found             |
| `/gallery`        | Visual collections; current original site artwork is clearly labeled separately from absent personal work                                   |
| `/gallery/[slug]` | Unequal image mounts and captions, with related journal links                                                                               |
| `/links`          | Verified, visible public identities grouped by code/social/gaming/contact/other                                                             |
| `/guestbook`      | Existing approved-only comments, pagination and moderated no-login submission                                                               |

`/admin`, `/admin/login` and every API path retain their original server authorization. No schema, Auth, MFA, CAPTCHA, quota or moderation policy changed.

## Editable data

- `site.ts`: nickname, metadata and public navigation. Change `site.brand` once.
- `portfolio.ts`: existing canonical project IDs, descriptions, verified records and personal biography. Do not rename IDs to change presentation URLs.
- `archive.ts`: shared portrait slots and original visual studies. Earlier archive/writing specimens remain in the repository but are not published as personal journal entries.
- `hero.ts`: four-world links and the first editorial spread. The opening scene’s composition and scroll timeline remain the reference baseline.
- `universe.ts`: typed WorkEntry, JournalEntry, GalleryAlbum, PublicIdentity and LatelyItem collections, publish selectors, collaboration preferences and homepage selection.

Add verified image files under `public/archive/` and reference them using the existing `ArchiveMedia` contract. Multiple images are supported for works, journal entries and albums. Alt text, captions, dimensions and credit remain explicit. Do not store private drafts or personal secrets in public source data. Draft labels are publishing metadata, not an authorization system.

Work entries separate presentation slug from stable ID and `commentProjectId`. The five software entries reuse the current project IDs and moderated backend. New physical/creative entries may have `commentProjectId: null`; extending backend comment targets requires a separately reviewed future change. Empty categories are not filled with invented projects. Known status/technology fields stay unknown until verified.

Journal and Gallery have reciprocal `gallerySlugs`/`journalSlugs`; either side can establish a published cross-reference. Journal prioritizes reading, Gallery prioritizes images. No fictional diary, poem or photograph is added. The single `site-studies` album contains existing original site SVGs and says so.

Now / Lately filters visible entries, orders them and renders at most three. Every item supports a real image, title, optional date, description and related link. Its current array is empty. This is not a feed or a fake activity log.

Public identities require both `visible` and `verified`; category and order control presentation. Only the user-provided GitHub identity is configured. Add Instagram, Telegram, email, coding or game profiles only after confirming their public URLs. No private account/login or recovery fields exist in this contract.

## Collaboration

Each work supports `openToCollaboration`, `showCollaborationButton`, `collaborationMessage`, `contributionUrl` and `contributionVerifiedPublic`. SAT’chi is initially enabled; the other projects are opt-in through the data file. Configure these as owner preferences, not inferred project status.

Collaborate opens the existing native modal with an editable message containing the project title and canonical ID. Existing drafts are preserved by prepending context, rather than silently replacing or truncating them. The ordinary 4,000-character server limit still applies; a combined long draft must be shortened before sending. The message uses the existing private inbox endpoint and security checks, without visitor login or an additional backend.

Contribute appears only when a verified public GitHub URL and explicit verification flag are configured. None are currently configured; the portfolio’s private repository is not advertised as a contribution destination.

The public shell persists community availability and contact drafts across public route navigation. PageMotion is keyed by pathname, so old GSAP contexts revert before new route entrances initialize. The hero timeline remains unchanged. The selected Vault retains its per-chapter holds/handoffs; scroll length follows chapter count. Inner headings use a short masked entrance and existing media reveals, with reduced-motion fallback and native navigation.

## Future administration boundaries

These contracts can be supplied by a server content adapter in the next CMS task. Future owner-only editing must retain current allowlisting/MFA, distinguish public published content from private drafts, validate media/links, and preserve comment IDs. Today’s admin still manages its existing inbox and moderation; no content editor, upload API, migration or publishing backend was added.

Anonymous two-way conversations remain future work. Today’s contact flow saves one-way private messages; no visitor return token, reply polling or conversation access scheme is implemented. No deployment was performed.
