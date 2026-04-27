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
import formatHtml from "./plugins/formatHtml.ts";
import imageDimensions from "./plugins/imageDimensions.ts";
import metasOrder from "./plugins/metasOrder.ts";

const isDev = Deno.args.includes("-s");
const isCacheBuster = !isDev;
const isFormatHtml = !isDev && Deno.env.get("FORMAT_HTML") === "true";
const isRelativeUrls = Deno.env.get("RELATIVE_URLS") === "true";

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
 * @see https://lume.land/docs/getting-started/use-plugins/
 */
// Compile
site.use(jsx());
site.use(esbuild());
site.use(lightningCss());
if (isDev) site.use(sourceMaps());

// Images (URL 書き換え前に動かして TSX 記述どおりの src を解決する)
site.use(imageDimensions());
site.use(picture());
site.use(transformImages());
site.use(svgo());

// Inline (URL 書き換え前に動かして ?inline 参照のソースファイルを解決できるようにする)
site.use(inline({ copyAttributes: ["role", "title", /^aria-/, /^data-/] }));

// URLs (img.src や CSS url() の書き換えを含むので画像系 / inline の後)
// deno-lint-ignore lume/plugin-order
site.use(base_path());
if (isRelativeUrls) site.use(relativeUrls());

// Metas
// deno-lint-ignore lume/plugin-order
site.use(metas());
site.use(metasOrder());

// HTML post-processing
if (isCacheBuster) site.use(cacheBuster());
if (isFormatHtml) site.use(formatHtml());
else site.use(minifyHTML());

/**
 * Helpers
 * @see https://lume.land/docs/configuration/filters/
 */
site.helper("langPath", langPath, { type: "tag" });
site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("range", range, { type: "tag" });
site.helper("useAttrs", useAttrs, { type: "tag" });

export default site;
