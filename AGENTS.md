# AGENTS.md — guide for AI coding agents working on marek-website

## Project Overview

Personal website of Marek Dlugos (https://www.marekdlugos.com/). Built with **Hugo** (static site generator) and **Bootstrap 5**. No Hugo theme is used — all layouts are custom. The site is built and deployed to GitHub Pages by GitHub Actions (`.github/workflows/hugo.yml`) on every push to `master`; the `public/` build output is gitignored, never committed.

## Tech Stack

- **Hugo** — static site generator (no theme, fully custom layouts)
- **Bootstrap 5.3** — CSS framework (installed via npm, mounted as Hugo module)
- **Sass/SCSS** — custom styles on top of Bootstrap
- **Google Fonts** — Poppins (body) and Merriweather (blog articles)
- **Google Analytics** (gtag.js, ID: G-36B0M4RPHF)
- **Kit (ConvertKit)** — newsletter signup on blog posts

## Repository Structure

```
├── .github/workflows/   # CI: hugo.yml builds PRs, builds+deploys master to Pages
├── archetypes/          # Hugo content templates
│   ├── default.md       # Minimal archetype
│   └── post.md          # Blog post archetype (only the fields actually used)
├── assets/
│   ├── js/
│   │   ├── scroll-progress.js  # Fills the bottom progress bar
│   │   ├── toc.js              # Table of contents: current section, tap, Esc
│   │   └── world-map.js        # amCharts init; country codes injected at build time
│   └── sass/
│       ├── main.scss    # Main stylesheet (selective Bootstrap imports + custom styles)
│       └── styles.scss  # Bootstrap variable overrides
├── config.toml          # Hugo site configuration
├── content/             # Site content (pages + blog posts)
│   ├── _index.html      # Homepage
│   ├── work.html        # Work experience page
│   ├── side-projects.html
│   ├── hobbies.html     # Traveling, photography, videography, sports
│   ├── sharing.html     # Social links, writing, media, speaking
│   ├── now.html         # /now page
│   ├── education-awards.html
│   ├── privacy-policy.html
│   └── blog/
│       ├── _index.md    # Blog list page
│       └── *.md         # Blog posts (Markdown)
├── data/                # JSON data files consumed by shortcodes
│   ├── education/       # awards.json, semesters.json
│   ├── hobbies/         # countries.json, videos.json, series.json, podcast.json
│   ├── sharing/         # interviews.json, work.json, speaking.json, socialnetworks.json, etc.
│   └── work/            # clients.json
├── public/              # Build output — gitignored, built by CI
├── layouts/
│   ├── _default/
│   │   ├── baseof.html  # Base template (head, header, main block, footer, JS)
│   │   ├── single.html  # Default single page (just renders .Content)
│   │   ├── list.html    # Blog list page
│   │   └── _markup/render-link.html  # Custom link renderer (external → target="_blank")
│   ├── blog/single.html # Blog post layout (Merriweather font, TOC, newsletter)
│   ├── index.html       # Homepage layout
│   ├── 404.html         # 404 page
│   ├── partials/
│   │   ├── head.html    # <head>: meta, embedded SEO partials, CSS, analytics
│   │   ├── header.html  # Sticky navbar with Bootstrap collapse
│   │   ├── footer.html  # Footer with social links from data
│   │   ├── schema-person.html  # Person + WebSite JSON-LD, home page only
│   │   ├── toc.html            # Blog table of contents (rail + card)
│   │   └── toc-headings.html   # Recursive: flattens .Fragments.Headings
│   └── shortcodes/
│       ├── dated-list.html      # Generic dated row list; takes (folder, file)
│       ├── client-logos.html    # data/work/clients.json
│       ├── semesters-abroad.html # data/education/semesters.json
│       ├── video-series.html    # data/hobbies/series.json
│       ├── countries.html       # Countries for one continent
│       ├── countries-count.html # Number of countries visited
│       ├── world-map.html       # amCharts map, codes injected via js.Build
│       ├── videos-list.html     # data/hobbies/videos.json filtered by category param
│       ├── podcast.html         # Podcast embed
│       └── social.html          # data/sharing/socialnetworks.json
├── static/              # Static assets (images, SVGs, favicon)
│   ├── marek-dlugos.webp
│   ├── favicon.png
│   ├── robots.txt       # hand-maintained (Hugo does not generate one here)
│   ├── CNAME            # GitHub Pages custom-domain marker
│   ├── client-logos/*.svg
│   ├── hobbies/*.jpg|png
│   ├── sharing/*.svg|jpg
│   ├── awards/*.jpg
│   ├── external-link.svg
│   ├── humans.txt
│   └── podcast/         # Standalone podcast page, served verbatim
├── package.json         # npm (bootstrap + popper.js)
└── resources/           # Hugo resource cache (gitignored)
```

## Key Configuration (config.toml)

- `baseURL` = `https://www.marekdlugos.com/`
- `locale` = the language key (Hugo deprecated `languageCode` in v0.158; read it via `site.Language.Locale`)
- `relativeURLs` = true (all internal links are relative)
- `publishDir` is not set: output goes to the default `public/`
- Minification comes from CI's `--minify` flag, not config
- `disableKinds = ["taxonomy", "term"]` — tags/categories are not surfaced anywhere.
  Post front matter keeps them, so re-enabling is a one-line change plus
  `taxonomy.html` / `term.html` templates.
- `[params]` holds author, email, description, jobTitle, knowsAbout, clearbitKey,
  worksFor and the `images` og:image fallback. `[services.googleAnalytics].ID`
  holds the tracking ID. Never hardcode these in a template.
- Bootstrap JS is mounted from `node_modules` into Hugo's asset pipeline
- Taxonomies: `tags` and `categories`

## Development Commands

```bash
# Install dependencies
npm install

# Run local dev server (renders to memory; does not write publishDir)
hugo server

# Production build (outputs to public/; CI runs this and deploys the result)
hugo --gc --minify --printPathWarnings --printUnusedTemplates
```

Deployment: GitHub Actions (`.github/workflows/hugo.yml`) builds and deploys
to GitHub Pages on every push to `master`. PRs get a build-only check. Do not
commit `public/`.

## Content Conventions

### Pages

- Top-level pages are `.html` files in `content/` with YAML frontmatter
- Pages in the main nav use `menu: main` with a `weight` to control order:
  - Work (10), Side Projects (20), Education & Awards (25), Hobbies (30), Sharing (40), Now (50)
- Pages use raw HTML with Bootstrap grid classes inside Hugo content files
- The homepage (`content/_index.html`) uses `layout: single`

### Blog Posts

- Located in `content/blog/` as Markdown files
- Use kebab-case filenames matching the URL slug
- Frontmatter fields:
  ```yaml
  author: "Marek Dlugos"
  title: "Post Title"
  date: 2025-12-22T08:08:25+02:00
  description: "SEO description"
  draft: false
  tags: ["life"]
  categories: ["life"]
  ```
- Blog posts render with the `layouts/blog/single.html` template which uses the Merriweather serif font (`.story-body` class), shows a table of contents when a post has more than one heading, and includes a Kit newsletter signup form at the bottom. Do not add `layout:` — the section template already wins.
- The table of contents is built from `.Fragments.Headings` via `partials/toc-headings.html`, not from `.TableOfContents`. That skips the empty placeholder entries Hugo emits for heading levels a post does not use, and is not bound by `markup.tableOfContents` start/end levels. Posts head their sections at `###` because `h2` is styled as large as `h1`
- The contents card is chrome, not prose: it sets `font-family: var(--bs-font-sans-serif)` so it does not inherit the serif `.story-body` face. In its list, the gap between items must stay clearly larger than the gap between two wrapped lines of one item
- Opening the card is pure CSS (`:hover`, `:focus-within`). `assets/js/toc.js` only adds the current-section marker, tap toggling and Esc, so the card still works without JavaScript
- Anchors inside a page must be absolute (`{{ .Permalink }}#id`). A bare `#id` resolves against `<base href>` and jumps to the home page
- The blog list (`layouts/_default/list.html`) orders posts by publish date (newest first)
- External links in Markdown automatically get `target="_blank"` via the custom link renderer

### Data Files

- JSON files in `data/` are consumed by shortcodes
- `dated-list` takes a folder and a file (e.g. `{{</* dated-list "sharing" "work" */>}}` reads `data/sharing/work.json`) and renders any list of dated rows: writing, interviews, mentions, speaking, awards
- `dated-list` rows use `year`, optional `month`, `title`, and optional `url`, `medium`, `note` and `struck`
- One data file renders one list under its own heading. Do not merge files and re-split them with a filter
- `data/hobbies/countries.json` is the single source for the world map, the continent lists and the visited count. Each row has `name`, `continent` and `iso` (a string, or an array where one entry covers several map territories). A row flagged `home` is drawn on the map but not counted as visited
- `data/hobbies/videos.json` holds ALL videos with a `category` field (`"work"` or `"personal"`); the `videos-list` shortcode filters by it: `{{</* videos-list "work" */>}}`. Add new videos here.

## Styling Conventions

- **Bootstrap is imported selectively** in `assets/sass/main.scss` (legacy `@import` cherry-pick — Hugo compiles with LibSass, so `@use` and `sass:math` are unavailable). If markup starts using a Bootstrap component whose module isn't imported (e.g. tables, forms, badge, modal), add its `@import` in canonical bootstrap.scss order
- **Bootstrap variable overrides** go in `assets/sass/styles.scss` (imported between Bootstrap's `functions` and `variables`)
- **Custom styles** go in `assets/sass/main.scss` (after all Bootstrap imports)
- Google Fonts are loaded via `<link>` tags in `layouts/partials/head.html`, not via CSS `@import`
- Primary font: Poppins (sans-serif) for all pages
- Blog body font: Merriweather (serif), applied via `.story-body` class
- Base font size: 1.35rem, line height: 1.65
- Client logos use `.grayscale` class (CSS grayscale filter)
- External links carry `class="external"`, which appends an icon via a masked pseudo-element
- Navbar is fixed-top with backdrop blur
- A scroll progress bar (`.scroll-progress-bar`) is fixed to the bottom of the page. Do not name it `.progress-bar`; that shadows Bootstrap's component class
- Use Bootstrap's grid system (`row`/`col-md-*`) for all layouts
- Common column widths: `col-md-8` for main content, `col-md-4` for sidebars, `col-md-11` for wide headings

## Template Patterns

- All pages extend `baseof.html` via `{{ define "main" }}...{{ end }}`
- Partials: `head.html`, `header.html`, `footer.html`
- Shortcodes load data from `data/` using `hugo.Data.<folder>`. Do not use `site.Data`, which is deprecated
- SEO comes from Hugo's embedded partials: `opengraph.html`, `twitter_cards.html`, `google_analytics.html`. Never create project partials with those names, or they override the embedded ones
- JSON-LD lives in `partials/schema-person.html` and is built from `[params]` with `jsonify`
- Bootstrap JS (already minified upstream) is published via `resources.Get` → `resources.Copy "js/bundle.js"`
- CSS is compiled via `resources.Get "sass/main.scss" | css.Sass | fingerprint` with `outputStyle: compressed`; both scripts are fingerprinted too, and all three carry an `integrity` attribute
- `assets/js/*.js` is bundled with `js.Build`. `world-map.js` receives its country list through the `params` option and reads it via `import * as params from '@params'`

## Important Notes

- **No Hugo theme** — everything is custom in `layouts/`
- **Output directory is `public/`** (Hugo's default) and it is **gitignored**; GitHub Actions builds and deploys it. Never commit build output.
- The `resources/` and `node_modules/` directories are also gitignored
- Every page has exactly one `<h1>` (a `visually-hidden` one on section-based pages like Hobbies/Sharing); keep it that way when adding pages. `static/podcast/index.html` is the one exception: it is a standalone page served verbatim and has none
- The `<base href>` tag in `head.html` is load-bearing: raw-HTML content pages reference images with bare relative paths (`src="awards/foo.jpg"`) that resolve through it
- The blog is described as "authentic, non-AI generated" — respect this when creating content
- Images should be placed in `static/` in the appropriate subdirectory
- New data entries (articles, videos, clients, countries, etc.) go in the corresponding JSON file in `data/`
- `/podcast/` is a standalone document in `static/podcast/`, on its own Bootstrap 4 stack. It is not part of the Hugo layout system by design; putting it back under `content/` makes Hugo wrap it in `baseof.html` and emit two nested HTML documents
