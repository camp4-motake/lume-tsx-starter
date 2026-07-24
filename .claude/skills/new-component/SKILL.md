---
name: new-component
description: Scaffold a Lume component (comp.tsx + style.css, optional script.ts) following project conventions.
disable-model-invocation: true
argument-hint: <category>/<Name> (e.g. ui/Card or layouts/Hero)
---

Scaffold a new component at `src/_components/<category>/<Name>/` from the argument
`<category>/<Name>` (e.g. `ui/Card`). If the argument is missing or malformed, ask for it.

## Steps

1. Validate: `<category>` is an existing directory under `src/_components/` (currently `ui` or
   `layouts`); `<Name>` is PascalCase. Abort if `src/_components/<category>/<Name>/` already
   exists.
2. Derive the kebab-case class name from `<Name>` (e.g. `Card` → `card`, `NewsList` →
   `news-list`).
3. Create `comp.tsx` and `style.css` from the templates below, replacing `{Name}`,
   `{class-name}`, and `{category}`.
4. Only create `script.ts` if the user asked for client-side behavior; Lume auto-loads it, so an
   empty file adds a useless request.
5. Follow `.claude/rules/components.md` and `.claude/rules/css.md` for any adjustments beyond the
   templates (Tag prop rules, image rules, child class naming `_element`).
6. Report the created files and the usage snippet: `<comp.{category}.{Name}>...</comp.{category}.{Name}>`.

## comp.tsx template

For actionable/generic components expose a `Tag?` prop; hardcode the element when semantics fix
it (see components.md). Default shape:

```tsx
import { useAttrs } from "#helpers";
import clsx from "clsx";

export interface Props {
  Tag?: "div" | "li";
}

export default function {Name}(
  { Tag = "div", children, ...props }: Props & Lume.Data,
) {
  const attributes = useAttrs(props, Tag);

  return (
    <Tag {...{ ...attributes }} class={clsx("{class-name}", props?.class)}>
      {children}
    </Tag>
  );
}
```

## style.css template

```css
@layer components.{category} {
  .{class-name} {
    @layer elements {
      --_color: var(--color-text);

      display: block grid;
    }

    @layer states {
    }

    @layer modifiers {
    }
  }
}
```

Remove empty `states` / `modifiers` sublayers only if stylelint complains; otherwise keep the
three-sublayer skeleton. Child elements use `_element` class names (never BEM
`block__element`), scoped inside the `elements` sublayer.
