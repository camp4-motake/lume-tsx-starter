/**
 * set inert function
 * @see https://yuheiy.com/2025-02-24-make-the-outside-inert
 *
 * @param el
 */
export function setInert(el: HTMLElement): () => void {
  const undos: (() => void)[] = [];

  crawlSiblingsUp(el, (sibling) => {
    if (!sibling.inert) {
      if (!sibling.hasAttribute("data-inert-ignore")) {
        sibling.inert = true;
      }

      undos.push(() => {
        sibling.inert = false;
      });
    }
  });

  return () => {
    while (undos.length > 0) {
      const undo = undos.pop();
      if (undo) undo();
    }
  };
}

function crawlSiblingsUp(
  el: HTMLElement,
  callback: (sibling: HTMLElement) => void,
): void {
  if (el.isSameNode(document.body) || !el.parentNode) {
    return;
  }

  const parent = el.parentNode;

  for (const sibling of Array.from(parent.children)) {
    if (sibling.isSameNode(el)) {
      if (parent instanceof HTMLElement) {
        crawlSiblingsUp(parent, callback);
      }
    } else {
      if (sibling instanceof HTMLElement) {
        callback(sibling);
      }
    }
  }
}
