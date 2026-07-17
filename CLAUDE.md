This file provides guidance to coding agents when working with code in this repository.

## Runtime

Lume 3 on Deno. Do not run `npm install` — `node_modules/` exists only because
`nodeModulesDir: "auto"` is set for npm interop.

## Commands

- `deno task serve` (alias: `dev`) — dev server
- `deno task build` — production build to `_site/`
- `deno task build:fmt` — build with `FORMAT_HTML=true` (pretty HTML via the native Deno DOM
  `formatHtml` plugin; otherwise non-dev builds run `minify_html`)
- `deno task zip` — build + zip `_site/` into `_zip/` (override prefix with `ZIP_PREFIX`)
- `deno task lint` / `deno task format` — `deno lint`/`fmt` + `stylelint` on `src/**/*.css`

`RELATIVE_URLS=true` enables Lume's `relative_urls` plugin. Cache busting runs automatically in
non-dev builds.

## Architecture

- `_config.ts` — Lume config; the composition root for plugins. Image pipeline order is
  `imageDimensions → picture → imageQuality → transformImages → dropRedundantImages`; each
  constraint is documented in the plugin's own header.
- `src/_components/<category>/<Name>/comp.tsx` — components are accessed as
  `comp.<category>.<Name>`. Sibling `style.css` and `script.ts` are auto-loaded by Lume; do not
  import them.
- `src/_includes/layouts/Base.tsx` — the only layout. All pages set
  `export const layout = "layouts/Base.tsx"`.
- `src/_data/config.ts` — site-wide config exposed as `config` on every page.
- `src/assets/main.css` — CSS entry. Global cascade-layer order:
  `config, reset, utilities, components.layouts, components.ui`. Shared styles live in
  `src/_includes/styles/`.
- `src/_includes/scripts/index.ts` — global JS; bundled into `main.js` via the `layouts/Assets`
  component's `script.ts`.
- `plugins/` — self-contained, individually detachable Lume plugins (`cacheBuster`,
  `dropRedundantImages`, `formatHtml`, `imageDimensions`, `imageQuality`) plus the standalone
  `zip.ts` CLI script. Each file's JSDoc header documents purpose, ordering, registration, and how
  to remove it (delete the file plus its import/block in `_config.ts`).
- `#helpers` import alias → `src/_includes/helpers.ts`. Use `useAttrs(props, tagName?, omitKeys?)`
  when spreading props onto a DOM element.

## Conventions

Domain rules live in `.claude/rules/` and must be followed: `ts.md`, `components.md`, `css.md`,
`rules.md`.
