/**
 * lume auto dimension plugin
 *
 * 元画像のサイズと transform-images 属性 (例: "avif 360") から、
 * transformImages が生成する画像のサイズを width / height 属性に設定する。
 *
 * usage:
 *   site.use(imageDimensions()); // set before "base_path" / "relative_urls" / "picture" / "transformImages"
 *   (picture が transform-images 属性を削除する前に読む必要があるため、必ず picture より前に登録する)
 */

import type Site from "lume/core/site.ts";
import { imageSizeFromFile } from "npm:image-size@2.0.1/fromFile";

export default function imageDimensions() {
  return (site: Site) => {
    site.process([".html"], async (pages) => {
      const fileMap = new Map<string, string>();
      for (const f of site.files) {
        const diskPath = f.src.entry?.src;
        if (diskPath) fileMap.set(f.outputPath, diskPath);
      }

      for (const page of pages) {
        const images = page.document.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map((img) => applyDimensions(site, fileMap, img)),
        );
      }
    });
  };
}

async function applyDimensions(
  site: Site,
  fileMap: Map<string, string>,
  img: Element,
): Promise<void> {
  const raw = img.getAttribute("src");
  if (!raw || isExternalUrl(raw)) return;
  if (img.getAttribute("width") && img.getAttribute("height")) return;

  const src = raw.split("?")[0];
  const resolved = fileMap.get(src) ?? site.src(src);

  try {
    const { width, height } = await imageSizeFromFile(resolved);
    if (width && height) {
      const target = transformedSize(img, width, height);
      img.setAttribute("width", String(target.width));
      img.setAttribute("height", String(target.height));
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`サイズ取得失敗: ${src}`, message);
  }
}

interface ParsedSize {
  width: number;
  height?: number;
}

/**
 * picture プラグインの transform-images 指定から transformImages が生成する画像のサイズを求める。
 * サイズ指定がない場合 (属性なし / "" / "avif" のみ) は元画像のサイズを返す。
 */
function transformedSize(
  img: Element,
  srcWidth: number,
  srcHeight: number,
): { width: number; height: number } {
  // picture プラグインと同じ lookup (祖先要素の指定も有効)
  const transformImages = img.closest("[transform-images]")
    ?.getAttribute("transform-images");
  if (!transformImages) return { width: srcWidth, height: srcHeight };

  // picture プラグインと同じ規則: 数字で始まるトークンがサイズ指定
  const sizes = transformImages.trim().split(/\s+/)
    .filter((piece) => /^\d/.test(piece))
    .map(parseSize)
    .filter((size): size is ParsedSize => size !== undefined);
  if (!sizes.length) return { width: srcWidth, height: srcHeight };

  // 複数サイズ指定時、img の src には最小幅の生成画像が使われる
  const { width, height } = sizes.reduce((a, b) => (a.width <= b.width ? a : b));
  if (height) return { width, height };

  // 幅のみ指定: sharp の resize (withoutEnlargement: true) と同じく拡大はしない
  const targetWidth = Math.min(width, srcWidth);
  return {
    width: targetWidth,
    height: Math.round((srcHeight * targetWidth) / srcWidth),
  };
}

/** picture プラグインの parseSize と同じ書式: "<width>" / "<width>x<height>" / "@scale" 付き */
function parseSize(size: string): ParsedSize | undefined {
  const match = size.match(/^(\d+)(?:x(\d+))?(?:@[\d.,]+)?$/);
  if (!match) return undefined;
  const [, width, height] = match;
  return {
    width: parseInt(width),
    height: height ? parseInt(height) : undefined,
  };
}

function isExternalUrl(url: string): boolean {
  return /^[a-z][a-z\d+\-.]*:/i.test(url) || url.startsWith("//");
}
