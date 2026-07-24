import { isMatchURL } from "./conditional.ts";

const EXCLUDE_HASH_VALUES = ["", "#", "#0", "#todo"];
const EXCLUDE_SELECTORS = ["[data-anchor-scroll-ignore]", `[role="tab"]`].join(",");

export function anchorScroll(): void {
  const anchor = document.querySelectorAll<HTMLAnchorElement>(
    'a[href*="#"]',
  );
  for (const el of anchor) {
    if (!isMatchURL(el.href)) continue;
    el.addEventListener("click", handleAnchorClick);
  }
}

function handleAnchorClick(event: MouseEvent): void {
  const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a");
  if (!anchor?.href) return;

  const url = new URL(anchor.href);
  if (!url.hash || EXCLUDE_HASH_VALUES.includes(url.hash) || anchor.matches(EXCLUDE_SELECTORS)) {
    return;
  }

  const targetElement = document.querySelector<HTMLElement>(url.hash);
  if (!targetElement) return;

  event.preventDefault();
  scrollToElement(targetElement);
  history.pushState(null, "", url.hash);
}

function scrollToElement(element: HTMLElement): void {
  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
}
