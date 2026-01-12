import clsx from "clsx";

export default function (
  { ...attr }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = { ...useAttrs(attr, ["content"]) };
  const year = new Date().getFullYear();

  return (
    <footer
      {...{ ...attributes }}
      class={clsx("footer", attr?.class)}
    >
      <p class="copyright">
        <small>Copyright &copy; {year} corp name</small>
      </p>
    </footer>
  );
}
