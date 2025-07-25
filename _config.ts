import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import inline from "lume/plugins/inline.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import picture from "lume/plugins/picture.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";
import imageDimensions from "./scripts/imageDimensions.ts";
// import relativeUrls from "lume/plugins/relative_urls.ts";
import { pathJoin } from "./scripts/pathJoin.ts";

const isDev = Deno.args.includes("-s");

const site = lume({
  src: "./src",
  prettyUrls: true,
});

site.use(jsx());
site.use(esbuild({ options: { target: ["esnext", "safari16"] } }));
site.use(lightningCss());
site.use(svgo());
site.use(imageDimensions());
if (isDev) site.use(sourceMaps());
site.use(picture());
site.use(transformImages());
site.use(inline());
site.use(base_path());
// site.use(relativeUrls());

site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("uppercase", (body) => body.toUpperCase(), { type: "tag" });

site.add("/assets", "/assets");
site.ignore("README.md", "CHANGELOG.md", "node_modules");

site.script(
  "afterProcess",
  `deno run --allow-read --allow-write scripts/cacheBuster.ts`, // WORKAROUND: cache busting
  // `deno eval --allow-scripts 'for await (const e of Deno.readDir("_site/assets/img")) if (e.isFile && /\.(png|jpe?g)$/.test(e.name)) await Deno.remove(\`_site/assets/img/\${e.name}\`)'`, // WORKAROUND: remove unused png/jpg
);
if (!isDev) site.addEventListener("afterBuild", "afterProcess");

export default site;
