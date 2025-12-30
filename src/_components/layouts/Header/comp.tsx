import clsx from "clsx";

export default function (
  { title, ...attributes }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  return (
    <header
      {...useAttrs(attributes)}
      class={clsx("header", attributes?.class)}
    >
      <a href="/">{title}</a>
    </header>
  );
}
