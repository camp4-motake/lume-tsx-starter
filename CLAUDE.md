This file provides guidance to coding agents when working with code in this repository.

## Runtime

Lume 3 on Deno. Do not run `npm install` — `node_modules/` exists only because
`nodeModulesDir: "auto"` is set for npm interop.

## Commands

- `deno task serve` (alias: `dev`) — dev server
- `deno task build` — production build to `_site/`
- `deno task build:fmt` — build with pretty HTML (otherwise non-dev builds are minified)
- `deno task zip` — build + zip `_site/` into `_zip/` (override prefix with `ZIP_PREFIX`)
- `deno task lint` / `deno task format` — `deno lint`/`fmt` + `stylelint`

`RELATIVE_URLS=true` enables relative URLs. Cache busting runs automatically in non-dev builds.

## Architecture

- `_config.ts` — Lume config; the composition root for plugins. Image pipeline order matters:
  `imageDimensions → picture → imageQuality → transformImages → dropRedundantImages`.
- `plugins/` — self-contained, individually detachable local plugins; each file's header documents
  its ordering, registration, and how to remove it.
- `src/_components/<category>/<Name>/comp.tsx` — accessed as `comp.<category>.<Name>`. Sibling
  `style.css` and `script.ts` are auto-loaded by Lume; do not import them.
- `src/_includes/layouts/Base.tsx` — the only layout; all pages set
  `export const layout = "layouts/Base.tsx"`.
- `src/_data/config.ts` — site-wide config exposed as `config` on every page.
- `src/assets/main.css` — CSS entry. Cascade-layer order:
  `config, reset, utilities, components.layouts, components.ui`. Shared styles:
  `src/_includes/styles/`.
- `src/_includes/scripts/index.ts` — global JS entry, bundled into `main.js`.
- `#helpers` import alias → `src/_includes/helpers.ts`.

## Conventions

Domain rules live in `.claude/rules/` and must be followed (auto-loaded by path): `ts.md`,
`components.md`, `css.md`, `comments.md`, `rules.md`.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) and are written
in English unless instructed otherwise.
