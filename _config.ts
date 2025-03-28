import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import picture from "lume/plugins/picture.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import svgo from "lume/plugins/svgo.ts";
import transformImages from "lume/plugins/transform_images.ts";

const site = lume({ src: "./src", prettyUrls: false });

site.use(base_path());
site.use(esbuild());
site.use(jsx());
site.use(lightningcss());
site.use(picture());
site.use(relativeUrls());
site.use(svgo());
site.use(transformImages());

export default site;
