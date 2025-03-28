import type { Components, LayoutProps } from "./_type/page.d.ts";
export const layout = "layouts/BaseLayout.tsx";
export const title = "page1";

export default function Layout<T extends Components>({ comp }: LayoutProps<T>) {
  return (
    <>
      <comp.Heading />
      <comp.Image src="/assets/img/test300x300.png" />
    </>
  );
}
