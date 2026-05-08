/**
 * Meta tags
 *
 * use metas plugin
 * @see https://lume.land/plugins/metas/
 */
const metas = {
  site: "site name",
  title: "", // not edited when `title` and `site` both exist
  description: "=description",
  image: "=ogImage || /assets/ogp.png",
  lang: "ja_JP",
  twitter: "",
  keywords: "=keywords",
  generator: false,
};

export default metas;
