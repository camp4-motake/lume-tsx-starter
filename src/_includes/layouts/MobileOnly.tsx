export const layout = "layouts/Base.tsx";

export default (data: Lume.Data) => {
  const { children, comp } = data;
  const { DesktopView } = comp.layouts;

  return (
    <DesktopView data={data}>
      {children}
    </DesktopView>
  );
};
