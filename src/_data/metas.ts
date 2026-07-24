/**
 * Meta tags
 *
 * use metas plugin
 * @see https://lume.land/plugins/metas/
 */
const metas = {
  site: "=config.siteTitle",
  title: "", // not edited when `title` and `site` both exist
  description: "=description",
  image: "=ogImage || /assets/ogp.png",
  lang: "=config.locale",
  twitter: "",
  keywords: "=keywords",
  generator: false,
};

export default metas;
