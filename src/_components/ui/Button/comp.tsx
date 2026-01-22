import clsx from "clsx";

export interface Props {
  Tag?: "a" | "button";
}

export default function Button(
  { Tag = "a", children, ...props }: Props & Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = useAttrs(props, Tag);

  if (Tag === "button" && !attributes.type) {
    attributes.type = "button";
  }

  return (
    <Tag {...{ ...attributes }} class={clsx("button", props?.class)}>
      <span class="button__label">{children || `button`}</span>
    </Tag>
  );
}
