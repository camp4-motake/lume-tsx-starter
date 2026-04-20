---
paths: "**/*.css"
---

# CSS Rules

- For colors, sizes, and other design tokens used within a component, define local custom properties
  rather than referencing global variables directly. This improves reusability and maintainability.
- Local custom property names must start with `--_` (e.g., `--_color`, `--_size`, `--_gap`).
- Prefer CSS logical properties over physical ones (e.g., `inline-size` over `width`, `margin-block`
  over `margin-top`/`margin-bottom`).
- Prefer CSS Grid over Flexbox when either would work.
- **No Sass/SCSS**: Never create `.scss` files or use Sass syntax (`$variables`, `@mixin`,
  `@include`, `@extend`, `@import`/`@use`/`@forward`, `&` parent selector). Use CSS custom
  properties (`--var`) and native CSS nesting instead.
- Prefer container queries (`@container`) over media queries (`@media`) whenever possible.
- Prefer container query units (`cqi`, `cqb`) over viewport units (`vh`, `vw`). Avoid `vh`/`vw`
  unless absolutely necessary.
