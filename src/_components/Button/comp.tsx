export default function ({ children }: Lume.Data) {
  return <button type="button" className="button">{children || `button`}</button>;
}
