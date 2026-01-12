export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const {
    children,
    comp,
    config,
    description,
    isHome,
    keywords,
    ogDescription,
    ogImage,
    ogTitle,
    ogType,
    tagline,
    title,
    url,
    webFonts,
  } = data;
  const { Assets, Header, Footer } = comp.layouts;
  const { pathJoin, url: urlHelper } = helpers;

  const titleText = [!isHome && title, config.siteTitle, isHome && tagline]
    .filter(Boolean)
    .join(" | ");

  return (
    <html lang={config.meta?.lang || "ja"}>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="format-detection" content="telephone=no" />
        <title>{titleText}</title>

        {description && <meta name="description" content={description || ""} />}
        {keywords || config?.keywords &&
            <meta name="keywords" content={keywords || config?.keywords} />}

        <meta property="og:locale" content={`${config.lang}_${config.region}`} />
        <meta property="og:type" content={ogType || "article"} />
        <meta property="og:title" content={ogTitle || titleText || ""} />
        {config?.siteName &&
          <meta property="og:site_name" content={config?.siteName || ""} />}
        {ogDescription || description && (
              <meta
                property="og:description"
                content={ogDescription || description}
              />
            )}
        <meta property="og:url" content={urlHelper(url, true)} />
        {ogImage || config?.ogImage &&
            (
              <meta
                property="og:image"
                content={urlHelper(pathJoin("/", ogImage || config?.ogImage), true)}
              />
            )}

        {config?.twitterSite && <meta name="twitter:site" content={config?.twitterSite} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle || titleText || ""} />
        {ogDescription || description && (
              <meta
                name="twitter:description"
                content={ogDescription || description}
              />
            )}

        <link rel="canonical" href={urlHelper(url, true)} />

        <Assets webFonts={webFonts} />

        {/* tracking tag */}
        {/* {{ __html: ``, }} */}
      </head>
      <body>
        <Header title={config.siteTitle} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
