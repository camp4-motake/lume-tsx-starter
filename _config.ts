/**
 * Lume config
 * @see https://github.com/lumeland/lume
 */

import { langPath, pathJoin, range, useAttrs } from "#helpers";
import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import inline from "lume/plugins/inline.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import metas from "lume/plugins/metas.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import picture from "lume/plugins/picture.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";
import cacheBuster from "./plugins/cacheBuster.ts";
import dropRedundantImages from "./plugins/dropRedundantImages.ts";
import formatHtml from "./plugins/formatHtml.ts";
import imageDimensions from "./plugins/imageDimensions.ts";
import imageQuality from "./plugins/imageQuality.ts";

const isDev = Deno.args.includes("-s");

/**
 * Lume configuration
 * @see https://lume.land/docs/configuration/config-file/
 */
const site = lume({
  src: "./src",
  prettyUrls: true,
  location: new URL("https://example.com/"),
  cssFile: "/assets/main.css",
  jsFile: "/assets/main.js",
});

/**
 * Add files
 * @see https://lume.land/docs/configuration/add-files/
 */
site.add("/assets", "/assets");
site.copy("/_static", "/");
site.ignore("README.md", "CHANGELOG.md", "node_modules");

/**
 * Plugins
 * カスタムプラグイン (./plugins/*) は import + site.use を消せば外せる。
 * @see https://lume.land/docs/getting-started/use-plugins/
 */
site.use(jsx());
site.use(esbuild());
site.use(lightningCss());
if (isDev) site.use(sourceMaps());

// 画像系 / inline は URL 書き換えより前に動かし、TSX 記述どおりのパスでソースを解決する
site.use(imageDimensions()); // picture() が transform-images 属性を消す前に読む
site.use(picture());
site.use(imageQuality({ formats: { avif: 80 } })); // transformImages() が読む前に quality を仕込む
site.use(transformImages());
site.use(dropRedundantImages()); // avif 生成後でないと除外対象を判定できない
site.use(svgo({ options: { plugins: ["preset-default", "prefixIds"] } }));
site.use(inline({ copyAttributes: ["role", "title", /^aria-/, /^data-/] }));

// img.src や CSS url() の書き換えを含むので画像系 / inline の後
// deno-lint-ignore lume/plugin-order
site.use(base_path());
if (Deno.env.get("RELATIVE_URLS") === "true") site.use(relativeUrls());

// deno-lint-ignore lume/plugin-order
site.use(metas());

if (!isDev) site.use(cacheBuster());
if (!isDev && Deno.env.get("FORMAT_HTML") === "true") site.use(formatHtml());
else site.use(minifyHTML());

/**
 * Helpers (src/_includes/helpers.ts via #helpers)
 * @see https://lume.land/docs/configuration/filters/
 */
site.helper("langPath", langPath, { type: "tag" });
site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("range", range, { type: "tag" });
site.helper("useAttrs", useAttrs, { type: "tag" });

export default site;
