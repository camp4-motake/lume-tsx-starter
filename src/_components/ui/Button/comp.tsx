import clsx from "clsx";

export default function (
  { children, ...attributes }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  return (
    <a
      {...useAttrs(attributes)}
      class={clsx("button", attributes?.class)}
    >
      <span class="button__label">{children || `button`}</span>
    </a>
  );
}
