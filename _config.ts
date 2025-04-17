import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import inline from "lume/plugins/inline.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import picture from "lume/plugins/picture.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import svgo from "lume/plugins/svgo.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import transformImages from "lume/plugins/transform_images.ts";

const site = lume({ src: "./src", prettyUrls: true });

site.add("/assets", "/assets");
site.ignore("README.md", "CHANGELOG.md", "node_modules");

site.use(jsx());
site.use(inline());
site.use(base_path());
site.use(relativeUrls());
site.use(esbuild());
site.use(tailwindcss());
site.use(lightningCss());
site.use(svgo());
site.use(picture());
site.use(transformImages());

site.process([".css", ".js"], (assets) => {
  const map: { [key: string]: string } = {
    "/style.css": "/assets/components.css",
    "/script.js": "/assets/components.js",
  };

  for (const asset of assets) {
    if (!map[asset.data.url]) continue;
    asset.data.url = map[asset.data.url];
  }
});

export default site;
