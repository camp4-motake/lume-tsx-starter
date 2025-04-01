export const layout = "layouts/BaseLayout.tsx";

export const title = "";
export const description = "";
export const keywords = "";
export const ogType = "website";
export const ogImage = "";

export default ({ comp }: Lume.Data) => (
  <>
    <comp.Heading />
    <comp.Image src="/assets/img/test300x300.png" />
  </>
);
