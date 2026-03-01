# CLAUDE.md — AI Assistant Guide for marek-website

## Project Overview

Personal website of Marek Dlugos (https://www.marekdlugos.com/). Built with **Hugo** (static site generator) and **Bootstrap 5**. No Hugo theme is used — all layouts are custom. The site is deployed as static HTML from the `docs/` directory (GitHub Pages).

## Tech Stack

- **Hugo** — static site generator (no theme, fully custom layouts)
- **Bootstrap 5.3** — CSS framework (installed via npm, mounted as Hugo module)
- **Sass/SCSS** — custom styles on top of Bootstrap
- **Google Fonts** — Poppins (body) and Merriweather (blog articles)
- **Google Analytics** (gtag.js, ID: G-36B0M4RPHF)
- **Kit (ConvertKit)** — newsletter signup on blog posts

## Repository Structure

```
├── archetypes/          # Hugo content templates
│   ├── default.md       # Minimal archetype
│   └── post.md          # Blog post archetype with full frontmatter
├── assets/
│   └── sass/
│       ├── main.scss    # Main stylesheet (imports styles.scss + bootstrap)
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
│   ├── humans.txt
│   ├── blog/
│   │   ├── _index.md    # Blog list page
│   │   └── *.md         # Blog posts (Markdown)
│   └── podcast/         # Standalone podcast page with own assets
├── data/                # JSON data files consumed by shortcodes
│   ├── educationawards/awards.json
│   ├── hobbies/         # asia.json, europe.json, videos.json, etc.
│   └── sharing/         # interviews.json, work.json, socialnetworks.json, etc.
├── docs/                # Build output (publishDir) — served by GitHub Pages
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
│   │   ├── head.html    # <head> with meta, CSS, analytics, scroll progress bar JS
│   │   ├── header.html  # Sticky navbar with Bootstrap collapse
│   │   └── footer.html  # Footer with social links
│   └── shortcodes/
│       ├── articles-list.html   # Lists items from data/sharing/*.json
│       ├── awards-list.html     # Lists data/educationawards/awards.json
│       ├── countries-traveled.html  # Lists countries from data/hobbies/*.json
│       ├── other-videos.html    # Lists data/hobbies/othervideos.json
│       ├── work-videos.html     # Lists data/hobbies/workvideos.json
│       ├── podcast.html         # Podcast embed
│       └── social.html          # Social network links from data/sharing/socialnetworks.json
├── static/              # Static assets (images, SVGs, favicon)
│   ├── marek-dlugos.webp
│   ├── favicon.png
│   ├── client-logos/*.svg
│   ├── hobbies/*.jpg|png
│   ├── sharing/*.svg|jpg
│   ├── awards/*.jpg
│   └── external-link.svg
├── package.json         # npm (bootstrap + popper.js)
└── resources/           # Hugo resource cache (gitignored)
```

## Key Configuration (config.toml)

- `baseURL` = `https://www.marekdlugos.com/`
- `relativeURLS` = true (all internal links are relative)
- `publishDir` = `docs` (output goes to `docs/`, not the default `public/`)
- `minifyOutput` = true
- Bootstrap JS is mounted from `node_modules` into Hugo's asset pipeline
- Taxonomies: `tags` and `categories`

## Development Commands

```bash
# Install dependencies
npm install

# Run local dev server
hugo server

# Build for production (outputs to docs/)
hugo
```

## Content Conventions

### Pages

- Top-level pages are `.html` files in `content/` with YAML frontmatter
- Pages in the main nav use `menu: main` with a `weight` to control order:
  - Work (10), Side Projects (20), Hobbies (30), Sharing (40)
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
  featured: true
  layout: "single"
  draft: false
  tags: ["life"]
  categories: ["life"]
  ```
- Blog posts render with the `layouts/blog/single.html` template which uses the Merriweather serif font (`.story-body` class), auto-generates a TOC for posts with multiple headings, and includes a Kit newsletter signup form at the bottom
- The blog list (`layouts/_default/list.html`) orders posts by publish date (newest first)
- External links in Markdown automatically get `target="_blank"` via the custom link renderer

### Data Files

- JSON files in `data/` are consumed by shortcodes
- Shortcodes take a parameter referencing the JSON filename (e.g., `{{</* articles-list "work" */>}}` reads `data/sharing/work.json`)
- Data entries typically have: `year`, `month`, `title`, `url`, and optional `medium` or `lang` fields

## Styling Conventions

- **Bootstrap variable overrides** go in `assets/sass/styles.scss` (imported before Bootstrap)
- **Custom styles** go in `assets/sass/main.scss` (after Bootstrap import)
- Primary font: Poppins (sans-serif) for all pages
- Blog body font: Merriweather (serif), applied via `.story-body` class
- Base font size: 1.35rem, line height: 1.65
- Client logos use `.grayscale` class (CSS grayscale filter)
- Navbar is fixed-top with backdrop blur
- A scroll progress bar (`.progress-bar`) is fixed to the bottom of the page
- Use Bootstrap's grid system (`row`/`col-md-*`) for all layouts
- Common column widths: `col-md-8` for main content, `col-md-4` for sidebars, `col-md-11` for wide headings

## Template Patterns

- All pages extend `baseof.html` via `{{ define "main" }}...{{ end }}`
- Partials: `head.html`, `header.html`, `footer.html`
- Shortcodes load data from `data/` directory using `index .Site.Data.<folder> <param>`
- Bootstrap JS is bundled via Hugo Pipes: `resources.Get` → `resources.Concat` → `resources.Minify`
- CSS is processed via Hugo's SCSS pipeline: `resources.Get "sass/main.scss" | toCSS | minify`

## Important Notes

- **No Hugo theme** — everything is custom in `layouts/`
- **Output directory is `docs/`**, not `public/` — this is for GitHub Pages deployment
- The `resources/` and `node_modules/` directories are gitignored
- The `post.md` archetype has many frontmatter fields from a previous theme; only `title`, `date`, `description`, `draft`, `tags`, `categories`, `featured`, `layout`, and `author` are actively used
- The blog is described as "authentic, non-AI generated" — respect this when creating content
- Images should be placed in `static/` in the appropriate subdirectory
- New data entries (articles, videos, etc.) go in the corresponding JSON file in `data/`
