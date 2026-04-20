---
paths: "**/comp.tsx"
---

# Lume TSX/JSX Components Rules

## Wrapper Element

### HTML Attribute Forwarding

- Import `useAttrs` from `#helpers` and apply it to the wrapper element.
- Filter props with `useAttrs(props, <tag>)` and spread the result onto the wrapper.
- Merge class names with `clsx("<component-name>", props?.class)`.

### Configurable Wrapper Tag

- Expose a `Tag?` prop (union of allowed tags, with a default) when the wrapper tag is not
  dictated by the component's purpose.
  - Example: `Tag?: "div" | "li"` for card-like components.
  - Example: `Tag?: "a" | "button"` for actionable controls.
- Pass the resolved `Tag` to `useAttrs(props, Tag)` so attribute filtering matches the
  rendered element.
- Do not expose `Tag` when the tag is semantically fixed (e.g. `a`, `button`, `details`,
  `header`, `section`, `footer`, `nav`); hardcode the element.

### Button Defaults

- When `Tag === "button"` and `attributes.type` is unset, default it to `"button"` to avoid
  implicit form submission.

### Template

```tsx
import { useAttrs } from "#helpers";
import clsx from "clsx";

export interface Props {
  Tag?: "a" | "button";
}

export default function Button(
  { Tag = "a", children, ...props }: Props & Lume.Data,
) {
  const attributes = useAttrs(props, Tag);

  if (Tag === "button" && !attributes.type) {
    attributes.type = "button";
  }

  return (
    <Tag {...{ ...attributes }} class={clsx("button", props?.class)}>
      <span class="_label">{children}</span>
    </Tag>
  );
}
```

## Component CSS — Cascade Layers

Component stylesheets (`style.css`) must use nested CSS cascade layers.

### Layer Naming

Use `@layer components.<category>` where `<category>` matches the component directory (e.g., `ui`,
`layouts`).

```css
@layer components.ui {
  .button {
    /* ... */
  }
}
```

### Sublayer Structure

Three sublayers in cascade order:

1. **elements** — Base styles and `--_` prefixed custom properties.
2. **states** — Interactive states (`:hover`, `:focus-visible`, `:disabled`); override custom
   properties.
3. **modifiers** — Variants (`.is-small`, `.has-style-narrow`); override custom properties and add
   declarations as needed.

### Template

```css
@layer components.ui {
  .{component-name} {
    @layer elements {
      --_color: var(--color-base);
      --_bg-color: var(--color-primary);
      /* base styles... */

      container-name: {component-name};
      container-type: inline-size;
    }

    @layer states {
      &:focus-visible {
        --_color: var(--color-primary);
        --_bg-color: var(--color-base);
      }

      @media (any-hover: hover) {
        &:hover {
          --_color: var(--color-primary);
          --_bg-color: var(--color-base);
        }
      }
    }

    @layer modifiers {
      &:is(.is-small) {
        --_font-size: 0.875rem;
        column-gap: 0.125em;
      }
    }
  }
}
```

### Rules

- Modifier classes use `is-` prefix, wrapped in `&:is(.is-*)`.
- Wrap hover states in `@media (any-hover: hover)` for touch device compatibility.

> Reference:
> <https://css-tricks.com/organizing-design-system-component-patterns-with-css-cascade-layers/>

## Child Element Class Names

Child elements use `_{element}` format (e.g., `_title`, `_label`). Do not use BEM-style
`{component}__{element}`.

```tsx
// Good
<span class="_title" />

// Bad
<span class="header__title" />
```

Scope child selectors within the elements layer:

```css
@layer elements {
  > ._title {
    /* ... */
  }
}
```

## Images

- Render images with `<img>` and a `transform-images` attribute. The Lume picture plugin
  auto-generates the `<picture>` wrapper and per-format `<source>` elements, so do not wrap in
  `<picture>` manually.
- Avoid CSS `background-image` for decorative or content images unless there is a specific reason
  (e.g., gradients, dynamic tiling).
- For `.jpg` and `.png` sources, set `transform-images="avif <ext>"` so an AVIF variant is
  generated alongside the original. Match `<ext>` to the source format (`jpg` for `.jpg`, `png`
  for `.png`).

```tsx
<img
  src="/assets/img/section.jpg"
  alt=""
  transform-images="avif jpg"
  loading="lazy"
/>;
```

### Responsive variants

Append width specs to the format list to generate multiple sizes. Pair with the `sizes` attribute
so the browser selects the correct source.

- `360 640` — generate 360px and 640px widths.
- `300@2` — generate 300px plus a 2× (600px) variant for high-DPI displays.
- `300x150@2` — crop to 300×150 plus a 2× variant.

Pick widths that cover the largest rendered size × DPR; oversized variants waste bandwidth.

```tsx
<img
  src="/assets/img/card.jpg"
  alt=""
  sizes="(min-width: 640px) 18rem, 11rem"
  transform-images="avif jpg 360 640"
  loading="lazy"
/>;
```

### Container-level configuration

Place `transform-images` on a wrapper element to apply the same settings to all descendant
`<img>`s. Per-image `transform-images` overrides the container value; `transform-images=""` on a
child opts out of transformation.

> Reference: <https://lume.land/plugins/picture/>

## Frontend Scripts

Place client-side scripts in the component directory as `script.ts`. Lume auto-loads it alongside
`style.css` from any folder containing `comp.tsx`.

```
_components
  └── button
      ├── comp.tsx
      ├── style.css
      └── script.ts
```

> Reference: <https://lume.land/docs/core/components/>
