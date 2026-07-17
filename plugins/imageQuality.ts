/**
 * lume image quality plugin
 *
 * picture プラグインが `transform-images="avif"` のような書式名だけを文字列で
 * 渡す結果、sharp はその format のデフォルト品質(AVIF=50 など)で出力する。
 * このプラグインは picture() と transformImages() の間に挟み、配列に積まれた
 * format 文字列を `{ format, quality }` の FormatOptions に格上げする。
 *
 * usage:
 *   site.use(imageQuality({ formats: { avif: 80 } })); // place between picture() and transformImages()
 */

import type Site from "lume/core/site.ts";

type Options = {
  formats?: Record<string, number>;
};

export default function imageQuality({ formats = {} }: Options = {}) {
  return (site: Site) => {
    site.process(() => {
      for (const item of [...site.files, ...site.pages]) {
        const tx = (item.data as { transformImages?: unknown }).transformImages;
        if (!tx) continue;
        const list = (Array.isArray(tx) ? tx : [tx]) as Array<{ format?: unknown }>;
        for (const entry of list) {
          const fmt = entry.format;
          if (typeof fmt === "string" && fmt in formats) {
            entry.format = { format: fmt, quality: formats[fmt] };
          }
        }
      }
    });
  };
}
