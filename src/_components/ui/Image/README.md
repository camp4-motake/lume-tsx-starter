# Auto Image Component

width and height and Lume Plugins attributes are auto added.

## Usage

```tsx
// default
<Image src="/assets/img/img.png" />

// with sources
<Image
  src="/assets/img/img.png"
  sources={[
    { srcset: "/assets/img/img.png", media: "(min-width: 48em)" },
  ]}
/>
```
