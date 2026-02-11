export const layout = "layouts/Base.tsx";
export const title = "example";
export const description = "";

export default ({ comp }: Lume.Data) => {
  const { Button, Image } = comp.ui;

  return (
    <div>
      <h1>Hello world!</h1>

      <figure>
        <Image src="/assets/img/test300x300.png" />
      </figure>

      <div>
        <Button id="test-btn" href="#" class="sample-btn" title="sample button">
          component sample
        </Button>
      </div>
    </div>
  );
};
