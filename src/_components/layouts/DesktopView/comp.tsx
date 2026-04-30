import { useAttrs } from "#helpers";
import clsx from "clsx";

export default ({ children, ...props }: Lume.Data) => {
  const attributes = useAttrs(props, "div");

  return (
    <div {...{ ...attributes }} class={clsx("desktop-view", props?.class)}>
      <aside>
        {/* Left column content */}
      </aside>
      {children}
      <aside>
        {/* Right column content */}
      </aside>
    </div>
  );
};
