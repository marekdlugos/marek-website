# marek-ds

The design system behind [marekdlugos.com](https://www.marekdlugos.com/), packaged as a Hugo theme that lives inside the site repository.

## What lives here

- `assets/css/theme.css`: every design token (type scale, spacing, colour, radii, motion). The single place to tune the look.
- `assets/css/base.css`: element defaults, font loading, reduced-motion and view-transition opt-ins.
- `assets/css/components/*.css`: the few things utilities cannot express (prose for Markdown output, the breakout grid, the TOC rail, media).
- `layouts/`: the page shell and every reusable component, in Hugo's 0.146+ structure (`baseof.html`, `_partials/components/`, `_shortcodes/`, `_markup/`).

## The boundary rule

Theme templates may read only: partial arguments, `.Params`, page methods, `site.Menus`, `site.Title` and `site.Params.ds`.

They may **not** read `hugo.Data`, any other `site.Params.*`, or name a content section. Anything that binds a component to this site's data is a shortcode or partial in the site's own `layouts/` that calls a theme component.

One site, one look. There are no colour schemes, no i18n, no feature flags. Theme params exist only where the site already varies.

## Tailwind

Styles are built with Tailwind v4 through Hugo's `css.TailwindCSS` pipe. Hugo runs the Tailwind CLI from the project root, so `@source "hugo_stats.json"` and `@import "tailwindcss"` resolve against the site, not the theme. The site's `package.json` carries the npm dependencies.

## Extracting to its own repository

When a second site or a public release appears:

```bash
git subtree split --prefix=themes/marek-ds -b marek-ds-main
```

Not before.
