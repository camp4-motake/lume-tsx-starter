import clsx from "clsx";

export default function (
  { title, ...attr }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = { ...useAttrs(attr, ["content"]) };

  return (
    <header
      {...{ ...attributes }}
      class={clsx("header", attr?.class)}
    >
      <a href="/">{title}</a>
    </header>
  );
}
