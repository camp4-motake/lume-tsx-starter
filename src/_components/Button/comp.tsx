import clsx from "clsx";
import { omit } from "es-toolkit";

export default function ({ children, ...attributes }: Lume.Data) {
  return (
    <a
      {...omit(attributes, ["children", "basename", "content"])}
      class={clsx("button", attributes?.class)}
    >
      <span class="button__label">{children || `button`}</span>
    </a>
  );
}
