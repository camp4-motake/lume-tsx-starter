export default function ({ children }: Lume.Data) {
  return <h1>{children as React.ReactNode}</h1>;
}
