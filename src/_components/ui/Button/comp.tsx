import clsx from "clsx";

export default function (
  { children, ...attr }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = useAttrs(attr, ["content"]);

  return (
    <a
      {...{ ...attributes }}
      class={clsx("button", attributes?.class)}
    >
      <span class="button__label">{children || `button`}</span>
    </a>
  );
}
