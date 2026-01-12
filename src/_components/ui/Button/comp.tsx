import clsx from "clsx";

export default function (
  { children, ...props }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = useAttrs(props, ["content"]);

  return (
    <a
      {...{ ...attributes }}
      class={clsx("button", props?.class)}
    >
      <span class="button__label">{children || `button`}</span>
    </a>
  );
}
