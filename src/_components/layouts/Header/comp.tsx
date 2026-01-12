import clsx from "clsx";

export default function (
  { title, ...props }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = { ...useAttrs(props, ["content"]) };

  return (
    <header
      {...{ ...attributes }}
      class={clsx("header", props?.class)}
    >
      <a href="/">{title}</a>
    </header>
  );
}
