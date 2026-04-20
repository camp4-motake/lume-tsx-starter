/**
 * lume auto dimension plugin
 *
 * usage:
 *   site.use(imageDimensions()); // set before "base_path" / "relative_urls" / "picture" / "transformImages"
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
      img.setAttribute("width", String(width));
      img.setAttribute("height", String(height));
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`サイズ取得失敗: ${src}`, message);
  }
}

function isExternalUrl(url: string): boolean {
  return /^[a-z][a-z\d+\-.]*:/i.test(url) || url.startsWith("//");
}
