export const layout = "layouts/Base.tsx";

export const title = "example";

export default ({ comp }: Lume.Data) => {
  return (
    <div>
      <h1>Hello world!</h1>
      <img
        src="/assets/img/test300x300.png"
        loading="lazy"
        transform-images="avif png"
      />
      <comp.Button attributes={{ href: "#" }}>component sample</comp.Button>
    </div>
  );
};
