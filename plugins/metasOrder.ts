/**
 * lume metas order plugin
 *
 * SEO/OGP 系 meta タグを critical CSS/JS より後、canonical / icon / manifest 系 link より前に集約する。
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

const ANCHOR_SELECTOR = [
  'link[rel="canonical"]',
  'link[rel="icon"]',
  'link[rel="shortcut icon"]',
  'link[rel="apple-touch-icon"]',
  'link[rel="manifest"]',
].join(",");

export default function metasOrder() {
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const head = page.document.head;
        if (!head) continue;

        const anchor = head.querySelector(ANCHOR_SELECTOR);
        if (!anchor) continue;

        for (const tag of head.querySelectorAll(META_SELECTOR)) {
          head.insertBefore(tag, anchor);
        }
      }
    });
  };
}
