const meta = {
  domain: "***.com",
  encoding: "UTF-8",
  lang: "ja",
  region: "JP",
  get locale() {
    return `${this.lang}_${this.region}`;
  },
  scheme: "https",
  siteTitle: "",
  siteName: "", // og:site_name
  get siteUrl() {
    return `${this.scheme}://${this.domain}/`;
  },
  ogImage: "/assets/ogp.jpg",
  ogType: "article",
  tagline: "",
  keywords: "",
  twitterSite: "",
  webFonts: [`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap`],
};

export default meta;
