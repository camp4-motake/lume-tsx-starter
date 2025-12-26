/**
 * Lume Plugins
 * @see https://lume.land/plugins/
 */
import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import inline from "lume/plugins/inline.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import picture from "lume/plugins/picture.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";

import { pathJoin, range, useAttrs } from "./scripts/helpers.ts";
import imageDimensions from "./scripts/imageDimensions.ts";

const isDev = Deno.args.includes("-s");
const isFormatHtml = true;

/**
 * Lume config
 * @see https://lume.land/docs/configuration/config-file/
 */
const site = lume({
  src: "./src",
  prettyUrls: true,
  cssFile: "/assets/main.css",
  jsFile: "/assets/main.js",

  // @see https://lume.land/plugins/base_path/
  location: new URL("https://example.com/"),
});

site.use(jsx());
site.use(esbuild({ options: { target: ["esnext", "safari16"] } }));
site.use(lightningCss());
site.use(svgo());
site.use(imageDimensions());
if (isDev) site.use(sourceMaps());
site.use(base_path());
site.use(picture());
site.use(transformImages());
site.use(inline({ copyAttributes: ["role", "title", /^aria-/, /^data-/] }));
site.use(relativeUrls());

site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("range", range, { type: "tag" });
site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("uppercase", (body) => body.toUpperCase(), { type: "tag" });
site.helper("useAttrs", useAttrs, { type: "tag" });

site.add("/assets", "/assets");
site.ignore("README.md", "CHANGELOG.md", "node_modules");

// WORKAROUND: cache busting
if (!isDev) {
  const loc = site?.options?.location?.pathname || "/";
  site.script(
    "afterProcess",
    `SITE_LOCATION=${loc} deno run --allow-read --allow-write --allow-env scripts/cacheBuster.ts`,
  );
  site.addEventListener("afterBuild", "afterProcess");
}

// WORKAROUND: format HTML
if (!isDev && isFormatHtml) {
  site.script(
    "format",
    `deno run --allow-read --allow-write --allow-env npm:js-beautify@latest './_site/**/*.html' --indent-size 2 --no-preserve-newlines --end-with-newline false --extra-liners "" --unformatted "script,style,svg,noscript" --replace`,
  );
  site.addEventListener("afterBuild", "format");
}

export default site;
