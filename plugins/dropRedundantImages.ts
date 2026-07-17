/**
 * dropRedundantImages — AVIF 変換済みの原本画像を出力から除外する
 *
 * transformImages が `.avif` 変種を生成したあと、同じ stem を持つ原本画像
 * (デフォルト: `.png` / `.jpg` / `.jpeg`) のページを除外する。picture/source
 * タグは既に AVIF を参照しているので、原本を出さないことで配信容量を削る。
 *
 * Ordering: transformImages() の後に登録する
 * Register: site.use(dropRedundantImages());
 * Remove:   このファイルと _config.ts の import + 登録ブロックを削除
 */

import type Site from "lume/core/site.ts";

type Options = {
  /** 除外対象の原本拡張子 (default: ["png", "jpg", "jpeg"]) */
  extensions?: string[];
};

export default function dropRedundantImages(
  { extensions = ["png", "jpg", "jpeg"] }: Options = {},
) {
  const escaped = extensions.map((ext) => ext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const redundantUrl = new RegExp(`^(.+)\\.(${escaped.join("|")})$`);

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
        const match = url.match(redundantUrl);
        if (match && avifUrls.has(match[1])) {
          allPages.splice(i, 1);
        }
      }
    });
  };
}
