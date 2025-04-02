export const layout = "layouts/BaseLayout.tsx";

export const title = "";
export const description = "";
export const keywords = "";
export const ogType = "website";
export const ogImage = "";

export default ({ comp }: Lume.Data) => {
  const { Heading } = comp;

  return (
    <>
      <Heading>Sample</Heading>
      <img src="/assets/img/test300x300.png" alt="" decoding="async" />
    </>
  );
};
