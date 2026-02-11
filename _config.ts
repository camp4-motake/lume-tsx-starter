/**
 * Lume config
 * @see https://github.com/lumeland/lume
 */

import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import imageSize from "lume/plugins/image_size.ts";
import inline from "lume/plugins/inline.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import picture from "lume/plugins/picture.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";
import cacheBuster from "./plugins/cacheBuster.ts";
import formatHtml from "./plugins/formatHtml.ts";
import { pathJoin, range, useAttrs } from "./plugins/helpers.ts";

const isDev = Deno.args.includes("-s");
const isCacheBuster = !isDev;
const isFormatHtml = !isDev;
const isRelativeUrls = true;

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
site.use(jsx());
site.use(esbuild({ options: { target: ["safari17"] } }));
site.use(lightningCss());
if (isDev) site.use(sourceMaps());
site.use(base_path());
site.use(picture());
site.use(transformImages());
site.use(imageSize());
site.use(svgo());
site.use(inline({ copyAttributes: ["role", "title", /^aria-/, /^data-/] }));
if (isRelativeUrls) site.use(relativeUrls());
if (isCacheBuster) site.use(cacheBuster());
if (isFormatHtml) site.use(formatHtml());

/**
 * Helpers
 * @see https://lume.land/docs/configuration/filters/
 */
site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("range", range, { type: "tag" });
site.helper("useAttrs", useAttrs, { type: "tag" });

export default site;
