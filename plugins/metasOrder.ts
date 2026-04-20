/**
 * lume metas order plugin
 *
 * `<head>` 内の meta タグを最初の <link> / <script> より前に並べ替える。
 *
 * usage:
 * site.use(metas());
 * site.use(metasOrder()); // metas プラグインの後で使用する
 */

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

const ANCHOR_TAGS = new Set(["LINK", "SCRIPT"]);

export default function metasOrder() {
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const head = page.document.head;
        if (!head) continue;

        const anchor = findFirstAnchor(head);
        if (!anchor) continue;

        for (const tag of head.querySelectorAll(META_SELECTOR)) {
          head.insertBefore(tag, anchor);
        }
      }
    });
  };
}

function findFirstAnchor(head: HTMLHeadElement): Element | null {
  for (const child of head.children) {
    if (ANCHOR_TAGS.has(child.tagName)) return child;
  }
  return null;
}
