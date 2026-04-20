export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const { children, comp, config } = data;
  const { Assets, Header, Footer } = comp.layouts;
  const { pathJoin, url: urlHelper } = helpers;

  const titleText = [!data?.isHome && data?.title, config.siteTitle, data?.isHome && data?.tagline]
    .filter(Boolean)
    .join(" | ");

  const description = data?.description;
  const keywords = data?.keywords ?? config?.keywords;
  const ogTitle = data?.ogTitle || titleText;
  const ogDescription = data?.ogDescription || description;
  const ogImagePath = data?.ogImage || config?.ogImage;
  const ogImageUrl = ogImagePath
    ? urlHelper(pathJoin("/", ogImagePath), true)
    : undefined;
  const canonicalUrl = urlHelper(data?.url, true);

  return (
    <html lang={config.lang || "ja"}>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="format-detection" content="telephone=no" />
        <title>{titleText}</title>

        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}

        <meta property="og:locale" content={`${config.lang}_${config.region}`} />
        <meta property="og:type" content={data?.ogType || "article"} />
        <meta property="og:title" content={ogTitle} />
        {config?.siteName && <meta property="og:site_name" content={config.siteName} />}
        {ogDescription && <meta property="og:description" content={ogDescription} />}
        <meta property="og:url" content={canonicalUrl} />
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}

        {config?.twitterSite && <meta name="twitter:site" content={config.twitterSite} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        {ogDescription && <meta name="twitter:description" content={ogDescription} />}

        <link rel="canonical" href={canonicalUrl} />

        <Assets webFonts={data?.webFonts} />

        {/* tracking tag */}
        {/* {{ __html: ``, }} */}
      </head>
      <body>
        {/* tracking tag (noscript) */}
        {/* {{ __html: ``, }} */}

        <Header title={config.siteTitle} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
