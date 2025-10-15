type ImgType = Element | HTMLImageElement;

export function decodeTracker(options: IntersectionObserverInit = {}): void {
  const images = document.querySelectorAll<HTMLImageElement>("img");

  for (const img of images) {
    if (img.closest("[data-track-ignore]")) {
      continue;
    }

    if (!("decode" in img)) {
      (img as ImgType).setAttribute("data-img-decoded", "true");
      continue;
    }

    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (!entry.isIntersecting) return;

        observer.unobserve(img);
        img.loading = "eager";

        if (img.complete) {
          img.setAttribute("data-img-decoded", "true");
          return;
        }

        img.decode()
          .then(() => {})
          .catch((error: Error) => console.error("Image decoding failed:", error))
          .finally(() => img.setAttribute("data-img-decoded", "true"));
      },
      options,
    );
    observer.observe(img);
  }
}
