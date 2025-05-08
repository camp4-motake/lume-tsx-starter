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
        const { document } = page;
        const images = document.querySelectorAll("img");

        for (const img of images) {
          const src = img.getAttribute("src");

          if (!src || img.getAttribute("width") || img.getAttribute("height")) {
            continue;
          }

          const filePath = site.src(`${src}`);
          try {
            const { width, height } = await imageSizeFromFile(filePath);
            if (width && height) {
              img.setAttribute("width", String(width));
              img.setAttribute("height", String(height));
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`サイズ取得失敗: ${src}`, message);
          }
        }
      }
    });
  };
}
