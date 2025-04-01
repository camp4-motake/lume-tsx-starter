export type WebFontsLink = {
  key?: string;
  path?: string;
};

export interface SiteMetadata {
  domain?: string;
  lang?: string;
  region?: string;
  scheme?: string;
  locale?: string;
  encoding?: string;
  description?: string;
  ogImage?: string;
  twitterSite?: string;
  tagline?: string;
  keywords?: string;
  siteTitle: string;
  siteName?: string;
  siteUrl?: string;
  webFonts?: WebFontsLink[];
}

export default {
  domain: "www.site.jp",
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
  tagline: "",
  keywords: "",
  twitterSite: "",
  webFonts: [],
} as SiteMetadata;
