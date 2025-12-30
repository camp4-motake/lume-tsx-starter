import clsx from "clsx";

export default function (
  { ...attributes }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const year = new Date().getFullYear();

  return (
    <footer
      {...useAttrs(attributes)}
      class={clsx("footer", attributes?.class)}
    >
      <p class="copyright">
        <small>&copy; {year} corp name</small>
      </p>
    </footer>
  );
}
