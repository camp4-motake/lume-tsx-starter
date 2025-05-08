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
import tailwindcss from "lume/plugins/tailwindcss.ts";
import transformImages from "lume/plugins/transform_images.ts";
import cacheBuster from "./scripts/cacheBuster.ts";
import imageDimensions from "./scripts/imageDimensions.ts";
import { pathJoin } from "./scripts/pathJoin.ts";

const isDev = Deno.args.includes("-s");

const site = lume({
  src: "./src",
  prettyUrls: true,
  components: {
    cssFile: "/assets/components.css",
    jsFile: "/assets/components.js",
  },
});

site.use(jsx());
site.use(esbuild({ options: { target: ["esnext", "safari16"] } }));
site.use(tailwindcss());
site.use(lightningCss());
site.use(svgo());
site.use(imageDimensions());

if (isDev) {
  site.use(sourceMaps());
}

site.use(picture());
site.use(transformImages());
site.use(inline());
site.use(base_path());
site.use(relativeUrls());

if (!isDev) {
  site.use(cacheBuster());
}

site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("uppercase", (body) => body.toUpperCase(), { type: "tag" });

site.add("/assets", "/assets");
site.ignore("README.md", "CHANGELOG.md", "node_modules");

export default site;
