# Signature scene references

Skills inspected and installed individually with Codex's documented `install-skill-from-github.py --repo mblode/agent-skills --path skills/ui-design skills/ui-animation skills/ui-verification` helper. Source README and MIT license reviewed first. Only these three installed, no application dependencies added. Instructions applied directly in this session.

UI Design: existing design system, aesthetic-direction, typography, images, responsive-design and section-layout guidelines. UI Animation: decision-framework, scroll-animations, choreography, measurement-guide and performance-deep-dive. UI Verification: session-setup, viewport-stress, console-network and focus-walk. Additional probes used during final validation are recorded in the validation document.

## Components studied

- [Systaliko Hero Gallery Scroll Animation on 21st](https://21st.dev/@youcefbnm/components/hero-gallery-scroll-animation): shared section progress and independent image transforms. Current public source reorganized into [ScrollAnimation](https://github.com/YoucefBnm/Systaliko-UI/blob/main/registry/scroll-animations/scroll-animation/index.tsx), [DistributedCards](https://github.com/YoucefBnm/Systaliko-UI/blob/main/registry/scroll-animations/distributed-cards/index.tsx) and [ScrollAnimationRotate](https://github.com/YoucefBnm/Systaliko-UI/blob/main/registry/scroll-animations/scroll-animation-rotate/index.tsx). Sources read in full. Dependencies: React, Motion, clsx/cn. [MIT license](https://github.com/YoucefBnm/Systaliko-UI/blob/main/LICENSE), copyright 2025 Youcef Benmessabih. Adapted techniques into our existing GSAP engine, with native sticky, direct linear scrubbing, no spring lag, no permanent will-change and a complete static fallback. No demo images copied. License notice retained in `docs/licenses/Systaliko-MIT.txt`.
- [Full Screen Scroll FX](https://21st.dev/@lovesickfromthe6ix/components/full-screen-scroll-fx): GSAP, fullscreen exhibit and navigation reference. Public usage inspected. Listing did not expose a clear license; source not copied.
- [Zoom Parallax](https://21st.dev/@efferd/components/zoom-parallax): layered image zoom reference. Public usage inspected; Motion dependency, demo uses Lenis. Listing license/source fields empty; source not copied, Lenis not installed.
- [Scroll media expansion hero](https://21st.dev/@arunachalam/components/scroll-expansion-hero): public media expansion usage inspected. No copied source/assets.
- [Project Showcase](https://21st.dev/@jatin-yadav05/components/project-showcase): inspected, not selected.

## Motion/art direction

[Wise / Ragged Edge on 60fps](https://60fps.design/motion/wise-by-ragged-edge): publicly accessible kinetic typography / strong flat-color composition reference. No purchase, account, MCP connection, source or graphics used.

[Strade](https://www.strade.tech/) and local saved HTML are visual reference only. Owner's `otabek_reference_hero_demo.html` and 6.11s, 18fps `otabek_hero_motion_preview.mp4` inspected. Contact sheet extracted at 3fps using the installed animation skill's script to `/tmp/otabek-hero-frames/contact_sheet.png`. Its opening/focus/handoff sequence informs timing. Homepage files untouched.

## Art and content boundary

Only existing original ProjectArt and StudyArt SVGs, honest photo reservations, and existing portfolio facts are used. The existing ArchiveMedia contract supplies future local image files, dimensions, captions and credits. This task does not create a photo upload backend or alter authentication.
