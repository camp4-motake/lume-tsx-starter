/**
 * lume auto dimension plugin
 *
 * usage:
 * site.use(imageDimensions()); // set before  "picture" and "transformImages" plugin
 * site.use(picture());
 * site.use(transformImages());
 */

import type Site from "lume/core/site.ts";
import { imageSizeFromFile } from "npm:image-size@2.0.1/fromFile";

export default function imageDimensions() {
  return (site: Site) => {
    site.process([".html"], async (pages) => {
      for (const page of pages) {
        const images = page.document.querySelectorAll("img");
        await Promise.all(Array.from(images).map((img) => applyDimensions(site, img)));
      }
    });
  };
}

async function applyDimensions(site: Site, img: Element): Promise<void> {
  const src = img.getAttribute("src");
  if (!src || isExternalUrl(src)) return;
  if (img.getAttribute("width") && img.getAttribute("height")) return;

  try {
    const { width, height } = await imageSizeFromFile(site.src(src));
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
