---
paths: "**/*.css"
---

# CSS Rules

- Define component-internal design tokens as local custom properties prefixed with `--_` (e.g.,
  `--_color`, `--_size`, `--_gap`).
- Prefer CSS logical properties over physical ones (e.g., `inline-size` over `width`, `margin-block`
  over `margin-top`/`margin-bottom`).
- Prefer CSS Grid over Flexbox when either would work.
- **No Sass/SCSS**: Never create `.scss` files or use Sass syntax (`$variables`, `@mixin`,
  `@include`, `@extend`, `@import`/`@use`/`@forward`, `&` parent selector). Use CSS custom
  properties (`--var`) and native CSS nesting instead.
- Prefer container queries (`@container`) over media queries (`@media`) whenever possible.
- Prefer container query units (`cqi`, `cqb`) over viewport units (`vh`, `vw`). Avoid `vh`/`vw`
  unless absolutely necessary.
- Write media queries and container queries mobile-first using comparison operator syntax (e.g.,
  `@media (width >= 40em)`, `@container (inline-size >= 30em)`). Avoid `max-*` and the legacy
  `min-*` form.
- Use `em` units for breakpoints, not `px`.
