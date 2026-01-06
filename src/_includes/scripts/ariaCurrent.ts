const EXCLUDE_SELECTORS = ["[data-gt-lang]", `[href*="#"]`].join(",");

export function ariaCurrent(selector = "a"): void {
  const { origin, pathname } = window.location;
  const nodeList = document.querySelectorAll(selector);
  const links = Array.prototype.slice.call(nodeList);

  for (const link of links) {
    if (!link.href || link.matches(EXCLUDE_SELECTORS)) {
      continue;
    }

    try {
      const target = new URL(link.href);

      if (target.origin === origin && target.pathname === pathname) {
        link.ariaCurrent = "page";
      }
    } catch (_error) {
      continue;
    }
  }
}
