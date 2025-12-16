export const layout = "layouts/Base.tsx";
export const title = "example";

export default ({ comp }: Lume.Data) => {
  const { Button } = comp;

  return (
    <div>
      <h1>Hello world!</h1>
      <figure>
        <img
          src="/assets/img/test300x300.png"
          loading="lazy"
          transform-images="avif png"
        />
      </figure>
      <div>
        <Button attributes={{ href: "#", class: "" }}>
          component sample
        </Button>
      </div>
    </div>
  );
};
