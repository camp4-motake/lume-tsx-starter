/**
 * lume metas order plugin
 *
 * `<head>` 内の meta タグを最初の <link> / <script> より前に並べ替える。
 *
 * usage:
 * site.use(metas());
 * site.use(metasOrder()); // metas プラグインの後で使用する
 */

import { type Element, type Node } from "@b-fuze/deno-dom";
import type Site from "lume/core/site.ts";

const META_SELECTOR = [
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
  'meta[name="description"]',
  'meta[name="keywords"]',
  'meta[name="robots"]',
  'meta[name="theme-color"]',
  'meta[name="generator"]',
  'meta[name^="fediverse:"]',
].join(",");

const ELEMENT_NODE = 1;
const ANCHOR_TAGS = new Set(["LINK", "SCRIPT"]);

export default function metasOrder() {
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const head = page.document?.head as unknown as Element | undefined;
        if (!head) continue;

        const anchor = findFirstLinkOrScript(head);
        if (!anchor) continue;

        const tags = head.querySelectorAll(META_SELECTOR);
        for (const tag of Array.from(tags) as unknown as Element[]) {
          head.insertBefore(tag, anchor);
        }
      }
    });
  };
}

function findFirstLinkOrScript(head: Element): Node | null {
  for (const node of Array.from(head.childNodes) as Node[]) {
    if (node.nodeType === ELEMENT_NODE && ANCHOR_TAGS.has((node as Element).tagName)) {
      return node;
    }
  }
  return null;
}
