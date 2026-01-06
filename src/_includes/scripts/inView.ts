type DataScrollAttr = "in" | "out";

export const inView = (options: IntersectionObserverInit = {}): void => {
  document.querySelectorAll<Element>("[data-scroll]").forEach((el) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Repeat
        if (el.hasAttribute("data-scroll-repeat")) {
          const attr: DataScrollAttr = entry.isIntersecting ? "in" : "out";
          el.setAttribute("data-scroll", attr);
          return;
        }

        // Once
        if (entry.isIntersecting) {
          el.setAttribute("data-scroll", "in");
          observer.unobserve(el);
        }
      },
      options,
    );
    observer.observe(el);
  });
};
