import clsx from "clsx";

export default function (
  { ...props }: Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = useAttrs(props, "footer");
  const year = new Date().getFullYear();

  return (
    <footer {...{ ...attributes }} class={clsx("footer", props?.class)}>
      <p class="copyright">
        <small>Copyright &copy; {year} corp name</small>
      </p>
    </footer>
  );
}
