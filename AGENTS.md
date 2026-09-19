# AGENTS.md — guide for AI coding agents working on marek-website

## Project Overview

Personal website of Marek Dlugos (https://www.marekdlugos.com/). Built with **Hugo** and a **design system packaged as an in-repo Hugo theme** (`themes/marek-ds/`) on **Tailwind v4**. The site is built and deployed to GitHub Pages by GitHub Actions (`.github/workflows/hugo.yml`) on every push to `master`; the `public/` build output is gitignored, never committed.

The design language is typography-first, monochrome and quiet: one sans (Inter), generous rhythm, a dozen components used consistently. The full rationale, decisions and reference measurements are in `docs/superpowers/specs/2026-09-04-design-system-theme-design.md`.

## Tech Stack

- **Hugo 0.163** (extended not required, kept in CI) with the 0.146+ layout structure (`baseof.html`, `_partials/`, `_shortcodes/`, `_markup/`)
- **Tailwind v4** via Hugo's native `css.TailwindCSS` pipe (npm: `tailwindcss`, `@tailwindcss/cli`)
- **Inter 4 variable**, self-hosted from `themes/marek-ds/static/fonts/` (Latin + Latin Extended subset, `opsz` + `wght` axes)
- **Prettier** with `prettier-plugin-go-template` and `prettier-plugin-tailwindcss` (class sorting); CI runs `npm run format:check`
- **Google Analytics** via Hugo's embedded partial (`[services.googleAnalytics]`), **Clearbit** tag, **Kit** newsletter form (no vendor script)

## Two trees, one rule

```
themes/marek-ds/        THE DESIGN SYSTEM. Portable; knows nothing about this site's data.
layouts/                SITE GLUE. Binds the site's data to theme components.
```

A template belongs in the theme unless it reads `hugo.Data`, a site-specific `site.Params.*`, or names a content section. Then it is a site shortcode or partial in `layouts/` that calls a theme component.

Theme templates may read only: partial arguments, `.Params`, page methods, `site.Menus`, `site.Title`, `site.Params.ds`, and the two params Hugo's own embedded templates read (`site.Params.description`, `site.Params.images`). Check: `grep -rn 'hugo.Data' themes/marek-ds/layouts` must return nothing.

One site, one look. No colour schemes, no i18n, no feature flags. Theme params (`[params.ds]` in `config.toml`, defaults in `themes/marek-ds/hugo.toml`) exist only where the site already varies: author name, newsletter endpoint and copy, styleguide sample image.

## Repository Structure

```
├── .github/workflows/hugo.yml   # CI: format check, build, deploy master to Pages
├── archetypes/post.md           # Blog post archetype
├── assets/
│   ├── images/                  # Site images: awards/, client-logos/, hobbies/, sharing/, marek-dlugos.webp
│   └── js/world-map.js          # amCharts init; country codes injected at build time
├── config.toml                  # Site config; [params.ds] feeds the theme
├── content/                     # Markdown + shortcodes ONLY. No HTML, no class attributes.
│   ├── _index.md                # Home: headline and status in front matter, rendered by layouts/home.html
│   ├── work.md, side-projects.md, education-awards.md, hobbies.md, sharing.md, now.md, privacy-policy.md
│   ├── styleguide.md            # Every component with sample data; published but unlisted and noindex
│   └── blog/                    # _index.md cascades article: true; posts are pure Markdown
├── data/                        # JSON consumed by site shortcodes
│   ├── education/               # awards.json, degrees.json, semesters.json
│   ├── hobbies/                 # countries.json, podcast.json, series.json, videos.json
│   ├── projects/projects.json   # side projects, grouped highlighted|other
│   ├── sharing/                 # interviews.json, lifestories.json, mentions.json, socialnetworks.json, speaking.json, work.json
│   └── work/                    # assignments.json, clients.json, experience.json
├── docs/superpowers/specs/      # Design spec
├── layouts/                     # SITE GLUE
│   ├── home.html                # Home composition: page-hero + newsletter band
│   ├── _partials/head/site.html     # Site-only <head>: Clearbit, rel=me, JSON-LD
│   ├── _partials/footer/links.html  # Footer links from socialnetworks.json (footer: true)
│   ├── _partials/schema-person.html # Person + WebSite JSON-LD (home only)
│   ├── _partials/schema-blogposting.html # BlogPosting JSON-LD (pages with `article`)
│   ├── _partials/schema-breadcrumb.html  # BreadcrumbList JSON-LD (every page but home)
│   └── _shortcodes/             # Data-bound wrappers: client-logos, experience-list, assignments,
│                                #   projects, education-timeline, dated-list, social, travel-stats,
│                                #   country-lists, world-map, podcast, videos-list, video-series
├── static/                      # favicon.png, robots.txt, CNAME, humans.txt, podcast/ (legacy microsite, untouched)
├── themes/marek-ds/             # THE DESIGN SYSTEM (see its README.md)
│   ├── hugo.toml                # version pin, [params.ds] defaults
│   ├── assets/css/main.css      # entry: @import "tailwindcss" source(none); @source "hugo_stats.json"
│   ├── assets/css/theme.css     # EVERY TOKEN. The single tweak point.
│   ├── assets/css/base.css      # font-face, element defaults, focus, reduced motion, view transitions
│   ├── assets/css/components/   # layout.css (breakout grid), prose.css, toc.css, scroll-progress.css
│   ├── assets/js/               # toc.js, newsletter.js
│   ├── static/fonts/            # InterVariable(-Italic).woff2
│   └── layouts/
│       ├── baseof.html, page.html, section.html, 404.html, styleguide.html
│       ├── _partials/head.html, head/{css,fonts,site}.html, header.html, footer.html, footer/links.html, toc.html, toc-headings.html
│       ├── _partials/components/  page-hero, section, section-header, heading, label-body, inner, timeline,
│       │                          timeline-entry, disclosure, card-grid, card, dated-list, logo-wall, stat-row,
│       │                          link-list, button, status-pill, arrow-link, byline, picture, figure, newsletter
│       ├── _partials/icons/*.svg
│       ├── _shortcodes/         # section, label-body, prose, figure
│       └── _markup/render-link.html
├── package.json                 # tailwindcss, @tailwindcss/cli, prettier + plugins; dev/build/format scripts
└── hugo_stats.json              # generated class inventory (gitignored, referenced explicitly)
```

## Development Commands

```bash
npm install
npm run dev            # hugo server -D (drafts included)
npm run build          # hugo --gc --minify --printPathWarnings --printUnusedTemplates
npm run format         # prettier: sorts Tailwind classes, formats templates and CSS
npm run format:check   # what CI runs
```

Every commit must build with zero warnings. Known quirk: the first `hugo server` on a clean checkout may build CSS before `hugo_stats.json` is complete; save any file once.

## How pages are composed

`themes/marek-ds/layouts/page.html` renders every single page in one of three modes chosen by front matter:

- **article** (`article: true`, cascaded from `content/blog/_index.md`): hero with byline, TOC rail, `.prose` content, newsletter.
- **prose** (`prose: true`): hero, `.prose` content. For plain Markdown pages (now, privacy policy).
- **default**: hero, then the content as a sequence of `section` shortcodes.

The hero title is `headline` when set, else the page title. `dek` adds a subtitle.

A content page looks like this:

```markdown
{{</* section title="Work Experience" width="wide" */>}}
{{</* experience-list */>}}
{{</* /section */>}}

{{</* section title="Education" width="wide" */>}}
{{</* label-body label="The Story" */>}}
Plain **Markdown** paragraphs.
{{</* /label-body */>}}
{{</* education-timeline */>}}
{{</* /section */>}}
```

**The container rule.** A container shortcode (`section`, `label-body`) holds EITHER Markdown OR nested shortcodes, never both. Hugo runs nested shortcode HTML through the Markdown renderer, where a blank line followed by indented markup becomes a code block. `components/inner.html` detects which kind it got: content starting with `<` passes through; anything else renders as Markdown inside `.prose`. To put text beside components, wrap it in `{{</* prose */>}}…{{</* /prose */>}}`.

`width="wide"` puts a section in the content track (`--container-wide`, 75rem), which the header and footer share, so a section heading lines up with the wordmark. The default is the reading measure (`--container-measure`, 42rem).

## Design system conventions (the harness)

- **Utilities live only in templates** (`themes/**/layouts`, `layouts/**`). `content/**` and `data/**` contain no class attributes and no raw HTML. Check: `grep -rn 'class=' content/` returns nothing.
- **Tokens come only from `themes/marek-ds/assets/css/theme.css`.** No hex colours, px font sizes or ad-hoc durations anywhere else. Stock Tailwind namespaces are wiped there, so `text-3xl`, `text-neutral-500` or `rounded-2xl` do not exist; only `text-xs|sm|md|base|lg|xl|2xl`, `text-ink|ink-2|muted`, `bg-surface|surface-2`, `border-hairline`, `rounded-sm|md|lg|pill`, `font-light|normal|medium|semibold`, `tracking-body|tight|display|wide`, `max-w-measure|wide|track`, `p-gutter`, `mt-block`, `mt-section`, `duration-fast|base|slow`, `ease-out|in-out`. To change the type scale, edit `--text-*` and nothing else.
- **The hierarchy rule.** The scale is a ladder and text may never sit on a rung at or above the heading it belongs to: `2xl` display, `xl` section title, `lg` entry title and dek, `base` long-form reading only, `md` supporting text inside a component, `sm` meta, `xs` captions. A timeline entry titled at `lg` carries its bullets at `md`, never at `base`.
- **Watch for stock utilities that shadow a token.** Most Tailwind utilities come from a namespace that `--*: initial` empties, but a few are static and cannot be overridden by a token. `max-w-prose` is one, which is why the measure token is `--container-measure` and the utility is `max-w-measure`. When a new token's utility does not take effect, check for a stock utility of the same name before debugging anything else.
- **Two-column components share one label column.** `--spacing-label` sets the width for both `label-body` and `timeline-entry`, so labels and dates line up down a page that mixes them.
- **Arbitrary values `[...]` need a same-line `{{/* why */}}` comment.** Review grep: `\[[^\]]*\]` in layouts.
- **One component = one partial** in `_partials/components/` with a doc comment listing props and defaults. Variants are props, never copies. Shortcodes are thin wrappers that parse params and call a partial.
- **Hand-written CSS only in `assets/css/components/*.css`**, inside `@layer components`, for what utilities cannot express: Markdown output (`.prose`), the named-line breakout grid, the TOC rail, scroll-driven animation. Each file's header says why it exists. Never style one element both ways. `@apply` is banned.
- **Images** live in `assets/images/` or page bundles and render through `components/picture.html` (WebP variants, srcset, dimensions, lazy). `static/` holds only favicon, robots, CNAME, humans.txt and the legacy podcast page.
- **Motion** uses `duration-*` and `ease-*` tokens; anything that moves respects `prefers-reduced-motion` (global reset in base.css).
- **Scroll-linked behaviour is JavaScript, not scroll timelines.** `assets/js/scroll.js` publishes `--scroll-progress` and toggles `data-compact` on the header from one passive, rAF-throttled listener. CSS scroll-driven animations would express both with no script, but Firefox has no support and Safari only from 26, and these are behaviours the design asks for on every visit rather than decoration that may degrade to nothing. Reveal effects that are safe to skip are still fair game for scroll timelines.
- **Every component appears on `/styleguide/`** (`themes/marek-ds/layouts/styleguide.html`). A component without a styleguide entry is incomplete.
- **Tailwind class scanning** reads `hugo_stats.json` (rendered HTML), so classes built with `printf` in templates are fine; classes toggled only by JavaScript are not. Prefer a `data-*` attribute styled in components CSS.
- **Extraction**: `git subtree split --prefix=themes/marek-ds -b marek-ds-main` when a second site or publication appears. Not before.

## Content Conventions

### Pages

- Top-level pages are Markdown in `content/` with YAML front matter. Pages in the main nav use `menu: main` with a `weight`: Work (10), Side Projects (20), Education & Awards (25), Hobbies (30), Sharing (40), Now (50). The blog is not in the nav.
- Structured, repeating content (>= 3 fields, repeats >= 3 times) lives in `data/` and is rendered by a site shortcode; everything else is Markdown between shortcode tags.

### Blog Posts

- `content/blog/*.md`, kebab-case filenames matching the slug. Front matter: `author`, `title`, `date`, `description`, `draft`, `tags`, `categories`, and optionally `lastmod` and `images`. Do not add `layout:` or `article:`; the section cascade handles it.
- `lastmod` is set by hand, only when a post is genuinely revised. It feeds `dateModified` in the BlogPosting JSON-LD and `lastmod` in the sitemap, so an unrevised post must not carry one. `enableGitInfo` is deliberately off: it would date every post to the last theme refactor.
- Headings start at `##`. The TOC rail renders when a post has more than one heading.
- The blog is "authentic, non-AI generated"; never write post content.
- External links open in a new tab with a small outward arrow (`_markup/render-link.html`).

### Data Files

- `dated-list` rows use `year`, optional `month`, `title`, optional `url`, `medium`, `note`, `struck`; or `label` instead of a date. One data file renders one list under its own heading.
- `data/work/experience.json` and `data/education/degrees.json` are timeline entries: `from`, `to` (or `date`), `title`, `subtitle`, `meta`, `body` (Markdown), `children`, `details [{label, body}]`.
- `data/hobbies/videos.json` holds all videos with a `category` (`work` | `personal`); `data/hobbies/countries.json` drives both the world map and the country lists.

## Key Configuration (config.toml)

- `baseURL = "https://www.marekdlugos.com/"`, `relativeURLs = false`: every URL is root-relative or absolute; in-page anchors are plain `#id`.
- `theme = "marek-ds"`.
- `[build.buildStats]` + `[[build.cachebusters]]` + the `hugo_stats.json` mount into `assets/notwatching/` drive Tailwind. `[security.exec].allow` lists `node` and `tailwindcss` explicitly.
- `[markup.goldmark]`: `renderer.unsafe = true`, `parser.wrapStandAloneImageWithinParagraph = false`, `renderHooks.image.useEmbedded = "never"`.
- `[params.ds]`: `author`, `newsletter.{action, heading, copy}`, `styleguide.image`. `[params]` also carries the SEO and JSON-LD values used by site partials.
- `disableKinds = ["taxonomy", "term"]`; post front matter keeps tags/categories for a one-line revert.

## Important Notes

- The theme's `head/css.html` stamps the class inventory's hash into the stylesheet's source name. Without it Hugo's resource cache would serve stale CSS after a template-only class change. Do not "simplify" it away.
- Every page has exactly one `<h1>`, rendered by `page-hero`. Section titles are `<h2>`, labels and entry titles `<h3>`. Pages whose first visible heading is their opening section (Education & Awards, Hobbies, Sharing) set `hideTitle: true`, which keeps the h1 for assistive tech without showing it.
- `static/podcast/` is a standalone legacy page with its own stack. Leave it alone.
- Do not commit `public/`, `resources/` or `hugo_stats.json`.
