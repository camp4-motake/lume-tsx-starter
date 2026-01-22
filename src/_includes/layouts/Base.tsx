export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const { children, comp, config } = data;
  const { Assets, Header, Footer } = comp.layouts;
  const { pathJoin, url: urlHelper } = helpers;

  const titleText = [!data?.isHome && data?.title, config.siteTitle, data?.isHome && data?.tagline]
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

        {data?.description && <meta name="description" content={data?.description || ""} />}
        {data?.keywords || config?.keywords &&
            <meta name="keywords" content={data?.keywords || config?.keywords} />}

        <meta property="og:locale" content={`${config.lang}_${config.region}`} />
        <meta property="og:type" content={data?.ogType || "article"} />
        <meta property="og:title" content={data?.ogTitle || titleText || ""} />
        {config?.siteName &&
          <meta property="og:site_name" content={config?.siteName || ""} />}
        {data?.ogDescription || data?.description && (
              <meta
                property="og:description"
                content={data?.ogDescription || data?.description}
              />
            )}
        <meta property="og:url" content={urlHelper(data?.url, true)} />
        {data?.ogImage || config?.ogImage &&
            (
              <meta
                property="og:image"
                content={urlHelper(pathJoin("/", data?.ogImage || config?.ogImage), true)}
              />
            )}

        {config?.twitterSite && <meta name="twitter:site" content={config?.twitterSite} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data?.ogTitle || titleText || ""} />
        {data?.ogDescription || data?.description && (
              <meta
                name="twitter:description"
                content={data?.ogDescription || data?.description}
              />
            )}

        <link rel="canonical" href={urlHelper(data?.url, true)} />

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
