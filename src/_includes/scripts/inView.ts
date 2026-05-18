type DataScrollAttr = "in" | "out";

export const inView = (options: IntersectionObserverInit = {}): void => {
  // shorthand
  document.querySelectorAll<Element>("[data-scroll-fade-in-img]").forEach((el) => {
    el.removeAttribute("data-scroll-fade-in-img");
    el.setAttribute("data-scroll-fade-in", "");
    el.setAttribute("data-decode-in-img", "");
  });

  // add observer
  const selectors = [
    "[data-scroll-fade-in]",
    "[data-scroll]",
  ];
  const targets = document.querySelectorAll<Element>(selectors.join(", "));
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target;

      // Repeat
      if (el.hasAttribute("data-scroll-repeat")) {
        const attr: DataScrollAttr = entry.isIntersecting ? "in" : "out";
        el.setAttribute("data-scroll", attr);
        continue;
      }

      // Once
      if (entry.isIntersecting) {
        el.setAttribute("data-scroll", "in");
        observer.unobserve(el);
      }
    }
  }, options);

  targets.forEach((el) => observer.observe(el));
};
