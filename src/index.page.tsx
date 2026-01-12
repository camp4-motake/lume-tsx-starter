export const layout = "layouts/Base.tsx";
export const title = "example";
export const description = "";

export default ({ comp }: Lume.Data) => {
  const { Button } = comp.ui;

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
        <Button id="test-btn" href="#" class="sample-btn" title="sample button">
          component sample
        </Button>
      </div>
    </div>
  );
};
