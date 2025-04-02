// https://lume.land/docs/configuration/config-file/

import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import inline from "lume/plugins/inline.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import picture from "lume/plugins/picture.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";
import { pathJoin } from "./_modules/pathJoin.ts";

const site = lume({ src: "./src", prettyUrls: true });

site.use(base_path());
site.use(esbuild({ options: { target: ["esnext", "safari16"] } }));
site.use(inline());
site.use(jsx());
site.use(lightningcss());
site.use(picture());
site.use(relativeUrls());
site.use(svgo());
site.use(transformImages());

site.helper("pathJoin", pathJoin, { type: "tag" });
site.helper("uppercase", (body) => body.toUpperCase(), { type: "tag" });

// replace components css|js output path
// https://lume.deno.dev/docs/core/components/
site.process([".css", ".js"], (assets) => {
  for (const asset of assets) {
    if (asset.data.url === "/components.css") asset.data.url = "/assets/components.css";
    if (asset.data.url === "/components.js") asset.data.url = "/assets/components.js";
  }
});

export default site;
