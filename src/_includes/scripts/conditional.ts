export const isTouchDevice = (): boolean => {
  return "ontouchstart" in document && "orientation" in window;
};

export const isMatchURL = (href: string): boolean => {
  const loc = new URL(window.location.href);
  const tgt = new URL(href);

  return (
    `${loc.origin}${loc.pathname}${loc.search}` ===
      `${tgt.origin}${tgt.pathname}${tgt.search}`
  );
};

export const isObject = (value: unknown): boolean => {
  return value !== null && typeof value === "object";
};
