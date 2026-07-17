/**
 * lume drop-redundant-images plugin
 *
 * transformImages が `.avif` 変種を生成したあと、同じ stem を持つ
 * `.png` / `.jpg` / `.jpeg` ページを出力から除外する。picture/source タグは
 * 既に AVIF を参照しているので、原本を出さないことで配信容量を削る。
 *
 * usage:
 *   site.use(dropRedundantImages()); // place AFTER transformImages()
 */

import type Site from "lume/core/site.ts";

export default function dropRedundantImages() {
  return (site: Site) => {
    site.process((_, allPages) => {
      const avifUrls = new Set(
        allPages
          .filter((p) => p.data.url?.endsWith(".avif"))
          .map((p) => p.data.url.slice(0, -5)),
      );
      for (let i = allPages.length - 1; i >= 0; i--) {
        const url = allPages[i].data.url;
        if (typeof url !== "string") continue;
        const match = url.match(/^(.+)\.(png|jpe?g)$/);
        if (match && avifUrls.has(match[1])) {
          allPages.splice(i, 1);
        }
      }
    });
  };
}
