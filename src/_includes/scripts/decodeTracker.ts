function markDecoded(img: HTMLImageElement): void {
  img.setAttribute("data-img-decoded", "true");
}

function handleIntersect(
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
): void {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;

    const img = entry.target as HTMLImageElement;
    observer.unobserve(img);
    img.loading = "eager";

    if (img.complete) {
      markDecoded(img);
      continue;
    }

    img.decode()
      .catch((error: unknown) => console.error("Image decoding failed:", error))
      .finally(() => markDecoded(img));
  }
}

export function decodeTracker(options: IntersectionObserverInit = {}): void {
  const observer = new IntersectionObserver(handleIntersect, options);
  const images = document.querySelectorAll<HTMLImageElement>("img");

  for (const img of images) {
    if (img.closest("[data-track-ignore]")) {
      continue;
    }

    if (!("decode" in img)) {
      markDecoded(img);
      continue;
    }

    observer.observe(img);
  }
}
