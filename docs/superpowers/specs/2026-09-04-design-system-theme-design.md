# Design system rebuild for marekdlugos.com, packaged as an in-repo Hugo theme

## Context

**Why.** The site's visual direction is right but there is no system underneath it. Presentation lives in `content/*.html` as Bootstrap grid and utility classes copied page to page (~44 `row`, ~60 `col-md-*`, ~60 spacing utilities). Design decisions are magic numbers in a 313-line SCSS file with an 11-line variable file. Repeated patterns (experience entry, label-plus-body split, dated list, logo wall, stat row, card) are hand-written every time. Bootstrap supplies a grid and a navbar (its JS is used only for navbar collapse) but fights the intended look. The LibSass pipeline it depends on was deprecated in Hugo 0.153, so staying put is not zero-maintenance either.

**Target look.** Apple / OpenAI design language: typography carries the hierarchy, monochrome palette, generous rhythmic whitespace, a dozen components used relentlessly, quiet purposeful motion. "Timeless".

**Reference measurements (browser, 1728px viewport).**

| Site | Body | Measure | Ink | Notes |
|---|---|---|---|---|
| cdevroe.com (owner's favourite) | system sans 22.4px / 1.55 | 620px (~55ch) | #111 on #fff | h1 52px w600 lh 1.15; date 14.4px #636363; links underlined in ink; li gap 10px |
| briankoberlein.com | Georgia Pro 18px / 1.8 | 550px | #333 | figures break out to 900px, 12px sans captions in #666 |
| exilelifestyle.com | Source Serif 4 16.8px / 1.72 | 680px | #3a3a3a | h1 30px w700, ls -0.02em |
| blog.gersande.com (Ghost) | Lora 20px / 1.7 | 720px inside 1440px track | white on #3f3f3f | gallery cards break out to "wide"; feature image + caption; callout card; captions at 64% opacity |
| openai.com article | OpenAI Sans 17px / 1.65, ls -0.01em | ~54ch | #000 | h1 50.8px w500 lh 1.04 ls -0.03em; meta 14px w500 at 60% black; hairline #e5e7eb; underlined ink links; pill radius 9999px |
| apple.com newsroom | SF Pro Text 17px / 1.47, ls -0.022em | | #1d1d1f | muted #86868b; surface-2 #f5f5f7; radii 8/11/12px; eyebrows 12px muted |

Takeaway: prose like cdevroe (large sans body, lh 1.55, ~60ch, #111) plus gersande-style media breakouts (normal / wide / full-bleed) for the blog. Apple and OpenAI both track body slightly tight and display headings tighter, at weight 500-600, never 700.

**Owner's earlier explorations and what they add.**
- Home mockup: hero headline with bold spans + portrait right; filled "My work" button and an outlined "Available for new projects" pill with a green dot; a two-column newsletter band (heading + copy left, form + inline "You have been subscribed" right); footer with link columns. Adds `button` variants, `status-pill`, site-wide `newsletter` band, columned `footer`.
- Education mockup: a **timeline**: date column left, title / subtitle / muted meta right, nested sub-entries, expandable rows ("Selected courses +", "Recognitions Expand"). Adds `timeline` + `timeline-entry` + `disclosure` (native `<details>`). The same shape fits work experience, so one component replaces experience entries, semesters abroad and credential blocks.
- "Work." template: eyebrow above a very large light-weight heading; image beside title + excerpt + "read more" blocks. Adds eyebrow and a light display weight for heroes.
- Tailwind Plus "Spotlight" template: centered pill nav, grid of quiet project cards (icon, title, excerpt, muted link) with hover surface, big bold h1 + dek. Adds the `card` quiet/hover variant. Built on Tailwind, which corroborates the tooling choice; a pattern reference, not something to copy.

**Three phases the architecture must carry.**
1. Reusable components, one visual language. (This plan.)
2. Cheap tuning: type scale, subheadings, cards, new components. (Token edits + new partials + styleguide.)
3. Award-calibre polish: motion, details, page transitions. (Hooks laid down here; animation built later on its own branch.)

## Decisions taken with the owner (2026-09-04)

- **Tooling: hybrid Tailwind v4** via Hugo's native `css.TailwindCSS`. Stock palette and type scale wiped (`--*: initial`) so the only utility vocabulary is the site's own tokens. Utilities only in templates. A small hand-written `@layer components` for prose, breakout grid, TOC rail, motion. No `@tailwindcss/typography`. `@apply` banned except for third-party DOM.
- **Font: self-hosted Inter 4 variable**, one family everywhere, blog included. Poppins, Merriweather and Google Fonts go.
- **Palette: fully monochrome.** Links are ink + underline. No accent token; one `positive` green used only for the status-pill dot.
- **Light only**; tokens named semantically (`ink`, `surface`, `muted`, `hairline`) so dark mode is a later `:root` override.
- **IA: keep the six pages and current menu.** Blog stays out of the nav. No page merges, no copy rewrite.
- **Packaging: the design system is a Hugo theme that lives inside this repo** at `themes/<name>/` (working name `marek-ds`; rename is a directory rename). See "Why a theme" below.
- **Branch:** `design/theme-system` off `refactor/idiomatic-hugo` (tree is clean; TOC rail is committed as `77d4e1f`). Tag the fork point `pre-theme` for rollback.

**Why the owner's "no harness" fear is addressed.** Framework-free CSS can be disciplined with stylelint and cascade layers, but two protections exist only in Tailwind: author-time enforcement (an off-token class does not compile; off-scale values are loud in a diff as `[..]`) and garbage collection (unused utilities cost zero bytes; hand-written CSS is never deleted). Both matter most when an AI writes and a human reviews. Exit path if Tailwind is ever abandoned: commit the built CSS (~10-20 KB) and delete the toolchain; tokens are plain custom properties.

## Why a theme, and why in-repo

**What was verified.**
- In Hugo a theme is a module. `theme = "x"` is sugar for `[[module.imports]] path = "x"` resolved from `themes/`. Lookup order: project files win over the theme, per file for layouts, deep-merged for data. A theme may carry its own `hugo.toml` with params and a `[module.hugoVersion]` pin.
- Hugo runs the Tailwind CLI with cwd = **project root** regardless of where the CSS file lives (verified in Hugo source, `resources/resource_transformers/cssjs/tailwindcss.go`). So a theme's `assets/css/main.css` can say `@source "hugo_stats.json"` and `@import "tailwindcss"` resolves from the project's `node_modules`. Hugoplate, a Tailwind v4 Hugo starter, does exactly this from its theme directory. Theme-local `@import "./components/x.css"` is inlined by Hugo from the union filesystem.
- Distributed themes (Blowfish, Congo, hugo-theme-tailwind, hugo-narrow) precompile their CSS because they cannot assume users have Node. A theme you alone consume runs the pipeline like Hugoplate. All of them expose tokens as CSS variables, not Tailwind config.
- Hugo 0.146+ new layout structure (`layouts/baseof.html`, `_partials/`, `_shortcodes/`, `_markup/`) coexists with the old one; Hugo normalises both at load time. `hugo new theme` scaffolds the new structure, no `theme.toml`, no exampleSite.
- Hugo 0.165 removes `tailwindcss` from the default `security.exec.allow` list; we add it explicitly now.
- Extraction later is one command: `git subtree split --prefix=themes/marek-ds -b marek-ds-main` produces a standalone history. Fully reversible.

**What the theme boundary buys.** It is a compiler-enforced convention: a theme template that reaches for `hugo.Data.sharing` or `site.Params.worksFor` is a reviewable smell, so components must take their inputs as partial args, `.Params`, menus or `site.Params.ds`. The theme's `hugo.toml` becomes the token/param manifest. The site keeps content, data, config and the site-specific glue. This is the harness for information architecture the way `@theme` is the harness for visuals.

**What it costs and how it is contained.** Two template trees to look in (theme vs site): mitigated by a one-line rule in AGENTS.md and by keeping the site tree tiny. Temptation to genericise (colour schemes, i18n, feature flags): explicitly forbidden; "one site, one look; params only where the site already varies." exampleSite maintenance: skipped; `/styleguide` in the site is the exampleSite. A separate repo now would mean two PRs per change for a solo owner iterating on design; not worth it until a second site exists.

**Rejected alternatives.** (A) Separate theme repo now: iteration tax with no consumer. (C) Conventions only in site `layouts/`: nothing enforces the component boundary.

## Verified integration facts (Hugo + Tailwind v4)

- `css.TailwindCSS` needs Hugo >= 0.161 and the npm CLI (`tailwindcss`, `@tailwindcss/cli`). Have 0.163.1 locally and in CI.
- Config: `build.buildStats.enable = true` writes `hugo_stats.json` to project root; mount it to `assets/notwatching/hugo_stats.json` with `disableWatch = true`; cachebuster `source = 'assets/notwatching/hugo_stats\.json'`, `target = 'css'`; `security.exec.allow` must include `^tailwindcss$` (setting it replaces the default list, so repeat `^(dart-)?sass(-embedded)?$`, `^go$`, `^git$`, `^npx$`, `^postcss$`).
- The CSS `<link>` must be wrapped in `templates.Defer (dict "key" "global")` so all pages are rendered before the stats file is read. Skip fingerprinting under `hugo.IsDevelopment` to avoid stale CSS in the dev server.
- Tailwind respects `.gitignore`. Documented pattern: gitignore `hugo_stats.json` **and** reference it explicitly with `@source "hugo_stats.json"`. Use `@import "tailwindcss" source(none)` so Tailwind does not also scan `AGENTS.md`, `content/`, `data/` and `static/podcast/index.html`.
- `hugo_stats.json` is built from rendered HTML, so classes from data-driven shortcodes and template-concatenated names are captured. Classes toggled only by JS: prefer a `data-*` attribute styled in components CSS; `@source inline("...")` as fallback.
- `@theme` namespaces: `--color-*`, `--font-*`, `--text-*` (+ `--text-x--line-height`), `--font-weight-*`, `--tracking-*`, `--spacing-*`, `--container-*` (drives `max-w-*`), `--radius-*`, `--shadow-*`, `--ease-*`. No `--duration-*` namespace; define durations as `:root` vars + `@utility`.
- `hugo_extended` is not required without Sass. Keep it in CI anyway.
- Image render hook context: `.Destination .Text .Title .Page .PlainText .IsBlock`; `markup.goldmark.parser.wrapStandAloneImageWithinParagraph = false` makes `.IsBlock` usable for `<figure>`.
- Cross-document View Transitions: `@view-transition { navigation: auto; }`; same-origin; Chrome 126+, Safari 18.2+.

**Assumptions to verify at the marked step.** (A1) Hugo finds `tailwindcss` in `node_modules/.bin`. (A2) `prettier-plugin-tailwindcss` sorts classes inside Go templates via `prettier-plugin-go-template`; fallback `rustywind`. (A3) Hugo's `resources/_gen` cache does not key on `hugo_stats.json`, so a restored CI cache can serve stale CSS; mitigated by the cache-key change. (A4) `.Inner | .Page.RenderString` keeps nested shortcode HTML with `goldmark.renderer.unsafe = true`.

## Architecture

Three layers; the layers matter more than the tool.
1. **Tokens** in the theme's `assets/css/theme.css` (`@theme`). The single tweak point for phase 2.
2. **Components** as theme partials in `_partials/components/*.html`, each with a leading doc comment listing props. Theme shortcodes are thin wrappers that parse params/`.Inner` and call a partial. Variants are props, never copies.
3. **Pages** compose components. Content pages become Markdown + shortcodes; structured repeating lists (>= 3 fields, repeats >= 3 times) live in `data/`.

**The boundary rule.** Theme templates may read only: partial args, `.Params`, `.Content`/`.Page` methods, `site.Menus`, `site.Title`, `site.Params.ds`. They may not read `hugo.Data`, `site.Params.<anything else>`, or name a content section. Anything that binds a component to this site's data is a **site** shortcode or partial that calls a theme component.

**File layout.**
```
themes/marek-ds/                          THEME: the design system (new 0.146 layout structure)
  hugo.toml                               [module.hugoVersion] min = "0.163.0"; [params.ds] defaults (newsletter action URL, nav options)
  layouts/baseof.html                     shell: skip link, header, <main class="layout-grid">, footer, deferred CSS, JS
  layouts/page.html                       generic article: page-hero, .prose content, toc, optional newsletter
  layouts/section.html                    generic list: page-hero + link-list of pages
  layouts/404.html
  layouts/styleguide.html                 renders every component with sample props (used by site's content/styleguide.md via `layout: styleguide`)
  layouts/_partials/head.html, head/css.html (templates.Defer + css.TailwindCSS), head/fonts.html
  layouts/_partials/header.html, footer.html, toc.html, toc-headings.html
  layouts/_partials/components/           page-hero, section, section-header, heading, label-body, timeline, timeline-entry,
                                          disclosure, card-grid, card, button, status-pill, arrow-link, link-list, picture,
                                          figure, gallery, callout, newsletter, stat-row, logo-wall, dated-list
  layouts/_partials/icons/*.svg
  layouts/_shortcodes/                    section, label-body, figure, gallery, callout, card-grid, card, timeline, stat-row, youtube (override)
  layouts/_markup/render-image.html, render-link.html
  assets/css/main.css                     @import "tailwindcss" source(none); @source "hugo_stats.json"; imports below
  assets/css/theme.css                    @theme tokens
  assets/css/base.css                     @layer base: font-face, html/body, ::selection, :focus-visible, reduced-motion, @view-transition, scroll progress
  assets/css/components/layout.css        named-line breakout grid
  assets/css/components/prose.css         .prose element styles (tokens only)
  assets/css/components/toc.css           TOC rail, ported from main.scss with literals -> tokens
  assets/css/components/media.css         figure, figcaption, gallery rows
  assets/fonts/InterVariable-subset.woff2
  assets/js/toc.js, newsletter.js
  README.md                               what the theme is, the boundary rule, how to extract

layouts/                                  SITE: small, site-specific
  home.html                               hero composition per mockup + newsletter band
  _partials/schema-person.html
  _shortcodes/                            data-bound wrappers: client-logos -> logo-wall, experience-list -> timeline,
                                          semesters-abroad -> timeline, projects -> card-grid, video-series -> card-grid,
                                          social, dated-list (folder,file) -> theme dated-list, countries, countries-count,
                                          world-map, podcast
  _partials/components/world-map.html     (amCharts embed; site-specific)
assets/js/world-map.js
assets/images/**                          moved from static/{awards,client-logos,hobbies,sharing}, marek-dlugos.webp
assets/css/components/legacy.css          TEMPORARY compat grid, deleted at end of Phase 2
content/, data/, config.toml, package.json, .github/
content/styleguide.md                     draft: true, layout: styleguide
```

**Token sheet (`themes/marek-ds/assets/css/theme.css`).** Values approximate cdevroe with Apple/OpenAI tracking; all tuneable in this one file.
```css
@theme {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --text-*: initial;
  --text-xs:   0.8rem;  --text-xs--line-height: 1.4;    /* captions */
  --text-sm:   0.9rem;  --text-sm--line-height: 1.45;   /* meta, nav, dates */
  --text-base: clamp(1.25rem, 1.2rem + 0.22vw, 1.375rem); --text-base--line-height: 1.55; /* 20 -> 22px body */
  --text-lg:   clamp(1.375rem, 1.28rem + 0.44vw, 1.625rem); --text-lg--line-height: 1.3;  /* h3, dek */
  --text-xl:   clamp(1.75rem, 1.55rem + 0.88vw, 2.25rem);   --text-xl--line-height: 1.2;  /* h2 */
  --text-2xl:  clamp(2.25rem, 1.85rem + 1.75vw, 3.25rem);   --text-2xl--line-height: 1.15; /* h1, 36 -> 52px */
  --tracking-body: -0.01em; --tracking-tight: -0.03em;
  --font-weight-light: 300; --font-weight-normal: 400; --font-weight-medium: 500; --font-weight-semibold: 600;

  --container-prose: 40rem;  --container-wide: 64rem;  --container-full: 90rem;
  --spacing-section: clamp(4rem, 3rem + 4vw, 7rem); --spacing-block: 2.5rem; --spacing-gutter: clamp(1rem, 0.5rem + 2.5vw, 2.5rem);

  --color-*: initial;
  --color-surface: #fff; --color-surface-2: #f5f5f7;
  --color-ink: #111; --color-ink-2: #3a3a3a; --color-muted: #6e6e73; --color-hairline: #e5e5e7;
  --color-positive: #34c759;   /* status-pill dot only */
  --color-white: #fff; --color-black: #000; --color-transparent: transparent; --color-current: currentColor;

  --radius-*: initial; --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-pill: 9999px;
  --shadow-*: initial; --shadow-card: 0 10px 34px rgb(0 0 0 / 0.11);
  --ease-*: initial; --ease-out: cubic-bezier(0.25, 1, 0.5, 1); --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
:root { color-scheme: light; --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 500ms; }
@utility duration-fast { transition-duration: var(--duration-fast); } /* + base, slow */
```
Consequence: `text-3xl`, `text-neutral-500`, `rounded-2xl` do not exist. That is the harness.

**Breakout grid (`layout.css`).** `<main class="layout-grid">` with named lines `full / wide / prose`; children default to `prose`; `.breakout-wide` / `.breakout-full` opt out. Figures, galleries, logo wall and world map use it. The one thing utilities cannot express and the reason the components layer exists.

**Component inventory (theme unless marked site).**

| Component | Type | Props | Replaces | Pages |
|---|---|---|---|---|
| `page-hero` | partial | `title`, `dek?`, `image?`, `actions[]?`, `weight?`=semibold/light, `hideTitle?` | `h1.mt-2`, home `display-6`, hidden h1s | all |
| `status-pill` | partial | `label`, `dot?` | none (mockup) | home |
| `section` | shortcode+partial | `id?`, `title?`, `eyebrow?`, `dek?`, `width?` | `<section>` + `row/col-md-11` | all content pages |
| `section-header` | partial | `eyebrow?`, `title`, `dek?`, `level`=2, `id?` | `h2`, `h3.mb-2` | sections, lists |
| `label-body` | shortcode+partial | `label`, `id?`, Inner | the `col-md-3 / col-md-9` split (x10) | education, sharing, hobbies |
| `timeline` + `timeline-entry` + `disclosure` | shortcode+partials | entry: `from, to, title, subtitle?, meta?, body?, bullets[]?, children[]?, details[{label, body}]?` | experience h4+small+ul, `semesters-abroad`, credential blocks | work, education |
| `card-grid` + `card` | shortcode+partial | grid `cols`=2/3; card `title, text, href?, icon?, image?, meta[]?, cta?, variant`=quiet/media | 2-up project blocks, `video-series` Bootstrap card | side-projects, hobbies |
| `dated-list` | partial (theme) + shortcode (site, binds `folder,file`) | rows `year, month?, title, url?, medium?, note?, struck?` | current 2/10 row | sharing, education |
| `logo-wall` | partial (theme) + `client-logos` shortcode (site) | `logos[{src, alt}]` | `client-logos` | work |
| `stat-row` | shortcode+partial | 3 stats | 3-col stat row | hobbies |
| `link-list` | partial | `items[{title, href, meta?, external?}]` | `videos-list`, `podcast`, assignments, blog index | hobbies, work, blog |
| `figure` | shortcode + render-image | `src, alt, caption?, width`=normal/wide/full | `img.img-fluid` | photo pages, blog |
| `gallery` | shortcode | `width`, `layout`=justified/grid, images via Inner lines or `match` | none yet | blog |
| `callout` | shortcode | `kind`, Inner | none yet | blog |
| `button`, `arrow-link` | partials | button `href, label, variant`=primary/outline/quiet, `external?`; arrow-link `href, label, external?` | `btn-danger`, `a.external` | hero, cards, newsletter, lists |
| `picture` | partial | `img, alt, sizes, class` | shared by hook, figure, hero | everywhere |
| `newsletter` | partial | `heading, copy`; action URL from `site.Params.ds.newsletter.action` | 5KB inline Kit blob | home band, blog post end |
| `header`, `footer`, `toc` | partials | footer link groups from `site.Params.ds.footer.groups` (site fills from data via a site partial override if needed) | current header/footer | shell |
| `world-map`, `countries`, `countries-count`, `social`, `podcast` | site shortcodes | | | hobbies, sharing |

Example of the pattern every component follows:
```go-html-template
{{- /* components/label-body.html
     Two-column label/body split. Props: label (required) | id (optional) | body (template.HTML, required) */ -}}
<div class="grid gap-y-2 md:grid-cols-[1fr_3fr] md:gap-x-10" {{ with .id }}id="{{ . }}"{{ end }}>{{/* [1fr_3fr]: 1:3 ratio has no token; sanctioned */}}
  <h3 class="text-sm font-medium uppercase tracking-wide text-muted md:pt-1">{{ .label }}</h3>
  <div class="prose">{{ .body }}</div>
</div>
```
Dynamic heading levels go through `heading.html` using `printf ... | safeHTML` (Go templates reject `<h{{ $l }}>`).

**Content authoring model.** Markdown + shortcodes; `git mv content/x.html content/x.md` so history follows. Rejected: front-matter block arrays (prose in YAML is painful). Theme `page.html` renders `page-hero` + `.Content`; a `layout: prose` switch wraps `.Content` in `.prose` for plain-Markdown pages (now, privacy-policy).

## Implementation phases

Each numbered step is one commit. Every commit must pass `hugo --gc --minify --printPathWarnings --printUnusedTemplates` with zero warnings. Commit style matches the repo (`area: what`). No squashing. One PR `design/theme-system` -> `master` (or stacked on `refactor/idiomatic-hugo` if that is not merged first), merged only when Phase 2 is complete so `master` is never half-Bootstrap.

### Phase 0: theme skeleton and toolchain, no visual change
1. `git checkout refactor/idiomatic-hugo && git tag pre-theme && git checkout -b design/theme-system`.
2. `hugo new theme marek-ds`, then prune the scaffold to: `hugo.toml`, `layouts/baseof.html`, `_partials/head.html`, `_partials/head/css.html`, `assets/css/main.css`, `README.md`. Theme `hugo.toml`: `[module.hugoVersion] min = "0.163.0"`, `[params.ds]` placeholders. Do **not** enable the theme in `config.toml` yet.
3. Root `package.json`: devDeps `tailwindcss@^4`, `@tailwindcss/cli@^4`, `prettier@^3`, `prettier-plugin-go-template`, `prettier-plugin-tailwindcss`; scripts `dev` (`hugo server -D --disableFastRender`), `build`, `format`, `format:check`. `.nvmrc` = 22; CI node 22. Keep bootstrap for now. One root `package.json`; skip `hugo mod npm pack`.
4. `config.toml`: `[build.buildStats]`, two `[[build.cachebusters]]`, the `hugo_stats.json` mount (keep the `assets` mount), `[security.exec].allow` list, `[markup.goldmark]` (`renderer.unsafe = true`, `parser.wrapStandAloneImageWithinParagraph = false`, `renderHooks.image.useEmbedded = "never"`). Add `hugo_stats.json` to `.gitignore`.
5. Theme `assets/css/main.css`: `@import "tailwindcss" source(none); @source "hugo_stats.json";` + empty `theme.css`/`base.css`. Prove the pipeline without linking: temporarily enable `theme = "marek-ds"` with the theme's `baseof.html` copied from the site's (Bootstrap still linked), and a `templates.Defer` block that builds the CSS but emits no `<link>`; verify `public/css/main.*.css` exists and contains `.mt-5` (a class already in the markup). Verifies A1 and the cwd-relative `@source` from inside `themes/`. Do not load Bootstrap and Tailwind on the same page for real: unlayered Bootstrap silently beats Tailwind's layers and they share names with different meanings (`mt-5` = 3rem vs 1.25rem, `container`).
6. `.github/workflows/hugo.yml`: cache key `hashFiles('assets/**', 'themes/**', 'layouts/**', 'content/**', 'data/**', 'package-lock.json')` (A3); add `npm run format:check`. Verify A3 locally: build, add a utility to a layout, build again without `server`, diff CSS.
7. `.prettierrc` (go-template parser for `*.html`, tailwind plugin, `tailwindStylesheet: ./themes/marek-ds/assets/css/main.css`) + `.prettierignore` (`static/podcast/`, `public/`, `resources/`, `content/`). Test A2; fall back to `rustywind` if unsorted.

### Phase 1: tokens, shell, prose (Bootstrap removed, theme live)
1. Theme `theme.css` (token sheet above) and `base.css` (`html { font-family: var(--font-sans); -webkit-font-smoothing: antialiased; font-optical-sizing: auto; font-feature-settings: "liga", "calt"; letter-spacing: var(--tracking-body) }`, body `bg-surface text-ink text-base`, `::selection`, `:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 3px }`, `a { text-decoration-thickness: from-font; text-underline-offset: 0.15em }`, global reduced-motion reset, `@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } }`).
2. Inter: subset `InterVariable.woff2` (Latin + Latin-ext, `pyftsubset` or `glyphhanger`) into theme `assets/fonts/`; `@font-face` with `font-display: swap`; `head/fonts.html` emits `<link rel="preload" as="font" crossorigin>`. Remove Google Fonts links and preconnects.
3. `layout.css` breakout grid in the theme; site `assets/css/components/legacy.css` compat grid (`@layer legacy` below `components`: `.row`, `.col-md-{2,3,4,6,8,9,10,11,12}`, `.text-muted`, `.mt-*`/`.mb-*` at Bootstrap values), imported from the theme's `main.css` via `@import "components/legacy.css"` resolved through the union assets FS with `skipInlineImportsNotFound`, so unconverted content pages stay browsable during Phase 2 and the import silently disappears when the file is deleted.
4. **Cutover commit** (shared chrome switches at once): enable `theme = "marek-ds"`; theme `baseof.html` (`<main class="layout-grid">`, deferred CSS link with `hugo.IsDevelopment` branch, skip link `sr-only focus:not-sr-only` `href="#main"`), `header.html` (no collapse, no JS: brand left, `<nav aria-label="Main">` right, `flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-ink-2`, active `text-ink underline`, `sticky top-0 bg-surface/95 backdrop-blur-sm`; six items wrap on 375px, no hamburger), `footer.html` (`border-t border-hairline text-sm text-muted`, link groups). Delete site `layouts/_default/baseof.html`, `partials/head.html`, `header.html`, `footer.html`; remove Bootstrap npm deps, its module mount and `assets/sass/`; `npm install`.
5. Scroll progress as a CSS scroll-driven animation in `base.css` (`animation-timeline: scroll(root)`, 2px, `bg-ink`, inside `@supports`). Delete `assets/js/scroll-progress.js`. Doubles as the Phase 3 proof-of-concept.
6. Theme `prose.css` (~60 lines, tokens only). Normalise blog headings `###`->`##`, `####`->`###` across `content/blog/*.md`; update the AGENTS.md sentence about it.
7. Theme `toc.css` + `toc.html`/`toc-headings.html`/`toc.js` moved from the site, literals -> tokens.
8. Remove `<base href>`: `git mv` `static/{awards,client-logos,hobbies,sharing}` and `marek-dlugos.webp` to site `assets/images/`; components resolve via `resources.Get`; data files keep bare names, site shortcodes prefix `images/`; `favicon.png`/`humans.txt` use `relURL`; anchors revert to plain `#id`; `relativeURLs = false`. Keep `static/podcast/`, `CNAME`, `robots.txt` untouched.
9. Theme `page.html` (article: `page-hero`, `.prose`, TOC, `newsletter` if `site.Params.ds.newsletter.action` set), `section.html` (list via `link-list` with date meta), `404.html`. Delete site `layouts/blog/single.html`, `_default/list.html`, `_default/single.html`, `404.html`. Blog intro prose moves into `content/blog/_index.md`. Newsletter = two-column band per mockup; form posts to Kit; ~20-line theme `newsletter.js` (`js.Build`) posts JSON with `fetch` and swaps in the inline success line, plain POST without JS. Drop `ck.5.js`. Verify with a real test address.

### Phase 2: components and page migration (one commit per page)
1. Build theme components: `page-hero`, `section`, `section-header`, `heading`, `label-body`, `picture`, `figure`, `button`, `status-pill`, `arrow-link`, `link-list`, `timeline`/`timeline-entry`/`disclosure`, `card-grid`/`card`, `dated-list`, `logo-wall`, `stat-row`. Theme `styleguide.html` + site `content/styleguide.md` (`draft: true`, `layout: styleguide`) rendering every component with sample props, grouped: type ramp, colours, spacing, components, media widths, prose. Verifies A4.
2. Site shortcodes rewritten as data-bound wrappers calling theme components: `client-logos`, `experience-list` (new `data/work/experience.json`), `semesters-abroad`, `projects` (new `data/projects/projects.json`), `video-series`, `dated-list`, `social`, `countries`, `countries-count`, `world-map`, `podcast`. Moved to `layouts/_shortcodes/` (new structure).
3. `now.md` (pure Markdown, `layout: prose`). Smallest page, proves the shell.
4. `work.md`: `headline` front matter; `section` + `client-logos`; `section` + `experience-list` (timeline); `link-list` from new `data/work/assignments.json`.
5. `side-projects.md`: `projects` -> `card-grid` of quiet cards for Highlighted and Other.
6. `education-awards.md`: `label-body` x3; one `timeline` for degrees with semesters abroad as nested children and courses/recognitions as `disclosure` rows (the education mockup); `figure`; `dated-list` for awards.
7. `sharing.md`: `social`, `label-body` + `dated-list` x4, `figure`.
8. `hobbies.md`: `stat-row`, `world-map` (`breakout-wide`), country columns, `figure`, `video-series` -> `card-grid` media variant, `link-list` x2, `label-body` x2.
9. `privacy-policy.md` (`layout: prose`).
10. Site `layouts/home.html` per mockup: `page-hero` with bold-span headline, portrait via `picture`, actions = `button` "My work" + `status-pill` "Available for new projects"; `newsletter` band between hairlines below.
11. External-link icon into theme `render-link.html` (inline SVG partial, `rel="noopener"`); delete `a.external::after` and `static/external-link.svg`.
12. Wrap-up: delete `legacy.css`; remove `[security] allowContent`; `grep -rn 'class=' content/` must return zero; AGENTS.md rewritten (see Harness); theme `README.md` finalised.

### Phase 2b: blog media system (gersande-inspired)
1. `archetypes/post/index.md` (page bundles for new posts; existing flat posts stay until they need images).
2. Theme `render-image.html`: resolve `.Page.Resources.Get` then `resources.Get "images/..."`; `Process "resize Nx webp q85"` for 640/960/1440/1920 <= source width; `srcset`, `sizes`, `width`/`height`, `loading="lazy"`, `decoding="async"`; `<figure>` + `<figcaption>` from `.Title` when `.IsBlock`. So `![Alt](photo.jpg "Caption")` yields a normal-width captioned figure.
3. `figure` shortcode for `width="wide|full"` sharing `picture.html`; `sizes` per width.
4. `gallery` shortcode: justified rows via flex (`flex-grow: aspect; flex-basis: aspect*12rem` inline, allowed since data-derived) or `layout="grid"`; optional caption; `breakout-wide` default.
5. `callout` shortcode. Bookmark card deferred.
6. Theme `youtube` override wrapping Hugo's embedded shortcode in `<figure class="breakout-wide aspect-video">`; `privacy.youtube.privacyEnhanced = true`.

### Phase 3 readiness (laid down above, no animation built)
Motion tokens and `duration-*` utilities; global reduced-motion reset; `@view-transition` opt-in with the page title `view-transition-name: none` until Phase 3 assigns names; the CSS scroll-driven progress bar as the `@supports (animation-timeline: scroll())` guard pattern; components emit stable `data-motion="hero|figure|section"` attributes (no behaviour) so a later GSAP/ScrollTrigger or pure-CSS layer targets them without markup changes. GSAP, if added, goes through `js.Build`.

## The harness (AGENTS.md "Design system conventions", replaces "Styling Conventions")
- **Two trees, one rule.** `themes/marek-ds/` is the design system; `layouts/` in the site is glue. A template goes in the theme unless it reads `hugo.Data`, a site-specific `site.Params.*`, or names a content section; then it is a site shortcode/partial that calls a theme component. Theme templates read only partial args, `.Params`, page methods, `site.Menus`, `site.Title`, `site.Params.ds`.
- Utilities live only in templates (`themes/**/layouts`, `layouts/**`). `content/**` and `data/**` contain no class attributes and no raw HTML. CI grep enforces.
- Tokens come only from the theme's `theme.css`. No hex, px font sizes or ad-hoc durations anywhere else. To change the type scale, edit `--text-*` and nothing else.
- Arbitrary values `[...]` require a same-line `{{/* why */}}` comment. Review grep: `\[[^\]]*\]`.
- One component = one partial in `_partials/components/` with a doc comment listing props and defaults; variants are props, never copies. Shortcodes are thin wrappers.
- Hand-written CSS only in the theme's `assets/css/components/*.css` inside `@layer components`, for Markdown-rendered content, named-line grids, motion, third-party DOM. Never style one element both ways. `@apply` banned outside third-party DOM.
- No genericising: one site, one look. Theme params exist only where the site already varies (newsletter action, footer groups). No colour schemes, no i18n, no feature flags.
- Images live in site `assets/images/` or page bundles and render through `picture.html`. `static/` holds only favicon, robots, CNAME, humans.txt, podcast.
- Every component appears on `/styleguide/`. A PR adding a component without a styleguide entry is incomplete.
- Motion uses `duration-*` + `ease-*` tokens and `motion-safe:` or a reduced-motion check.
- Extraction: `git subtree split --prefix=themes/marek-ds -b marek-ds-main` when a second site or publication appears. Not before.
- Known quirk: first `hugo server` on a clean checkout may build CSS before `hugo_stats.json` is complete; save any file once.

## Verification

| Phase | Check | Pass |
|---|---|---|
| 0 | `hugo`; inspect `public/css/main.*.css` | file exists, contains a known layout class, built from the theme's CSS |
| 0 | two-build stale-cache test (A3) | second build's CSS includes the newly added utility |
| 0 | `npm run format:check` | classes sorted (A2) or rustywind fallback chosen |
| 1 | `npm run build` | 0 warnings, 0 unused templates |
| 1 | DevTools network on a post | no fonts.googleapis, no bootstrap, one CSS, one preloaded woff2, JS only where needed |
| 1 | Lighthouse (`npx lighthouse ... --preset=desktop`) on home, a post, hobbies | perf >= 95, a11y 100 |
| 2 per page | `hugo server -D`, compare against a `pre-theme` build side by side | all content present; h1 > h2 > h3 nesting in the a11y tree |
| 2 end | `grep -rn 'class=' content/`; `grep -rn 'hugo.Data\|site.Params\.[^d]' themes/` | zero hits |
| 2 end | `npx lychee --offline public/` | 0 broken internal links |
| 2b | build with a test bundle post | webp variants in `public/blog/<slug>/`, `srcset` present, CLS 0 |
| all | PR CI green | |

## Phase 2 options recorded for later (not in this effort)
Centered pill nav with backdrop blur (Spotlight); dark-mode toggle (tokens already semantic); light-weight display hero (`weight=light` exists from day one); bookmark card for blog links; theme extraction to its own repo.

## Non-goals
No IA/nav restructure. No copy rewrite. No animations beyond the CSS progress bar. `static/podcast/` untouched. No dark mode. No taxonomy pages, search, comments. No exampleSite or `theme.toml` (not publishing). No visual-regression suite unless requested later.

## Critical files
- `themes/marek-ds/hugo.toml` (version pin, `params.ds` manifest)
- `themes/marek-ds/assets/css/theme.css` (every token; the single tweak point)
- `themes/marek-ds/assets/css/main.css` (`source(none)`, `@source "hugo_stats.json"`, imports)
- `themes/marek-ds/layouts/baseof.html` + `_partials/head/css.html` (`templates.Defer` + `css.TailwindCSS`)
- `themes/marek-ds/assets/css/components/layout.css` (breakout grid)
- `themes/marek-ds/layouts/_markup/render-image.html` (blog media)
- `config.toml` (theme import, buildStats, cachebusters, mounts, security.exec, goldmark, relativeURLs)
- `.github/workflows/hugo.yml` (cache key, node 22, format check)
- `AGENTS.md` (the harness)
