export const layout = "layouts/Base.tsx";

export const title = "example";

export default ({ comp }: Lume.Data) => {
  return (
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>
      <img
        src="/assets/img/test300x300.png"
        loading="lazy"
        transform-images="avif png"
      />
      <comp.Button>component sample</comp.Button>
    </div>
  );
};
