import clsx from "clsx";

export default function ({ children, attributes }: Lume.Data) {
  return (
    <a {...{ ...attributes }} class={clsx("button", attributes?.class)}>
      <span class="button__label">{children || `button`}</span>
    </a>
  );
}
