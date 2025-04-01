import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import picture from "lume/plugins/picture.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";
import { pathJoin } from "./lib/pathJoin.ts";

// https://lume.land/docs/configuration/config-file/
const site = lume({ src: "./src", prettyUrls: true });

site.use(base_path());
site.use(esbuild());
site.use(jsx());
site.use(lightningcss());
site.use(picture());
site.use(relativeUrls());
site.use(svgo());
site.use(transformImages());

site.helper("uppercase", (body) => body.toUpperCase(), { type: "tag" });
site.helper("pathJoin", pathJoin, { type: "tag" });

export default site;
