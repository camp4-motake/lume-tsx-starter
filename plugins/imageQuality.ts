/**
 * imageQuality — 画像フォーマットごとのエンコード品質を指定する
 *
 * picture プラグインが `transform-images="avif"` のような書式名だけを文字列で
 * 渡す結果、sharp はその format のデフォルト品質(AVIF=50 など)で出力する。
 * このプラグインは配列に積まれた format 文字列を `{ format, quality }` の
 * FormatOptions に格上げする。
 *
 * Ordering: picture() と transformImages() の間に登録する
 * Register: site.use(imageQuality({ formats: { avif: 80 } }));
 * Remove:   このファイルと _config.ts の import + 登録ブロックを削除
 */

import type Site from "lume/core/site.ts";

type Options = {
  /** フォーマット名 → quality の対応 (例: { avif: 80 }) */
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
