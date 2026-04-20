import { useAttrs } from "#helpers";
import clsx from "clsx";

export default function ({ title, ...props }: Lume.Data) {
  const attributes = useAttrs(props, "header");

  return (
    <header {...{ ...attributes }} class={clsx("header", props?.class)}>
      <a href="/">{title}</a>
    </header>
  );
}
