export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const {
    canonical,
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
  } = data;
  const { pathJoin } = helpers;
  const { Assets } = comp;

  const titleText = [!isHome && title, config.siteTitle, isHome && tagline]
    .filter(Boolean)
    .join(" &#8211; ");

  const canonicalUrl = pathJoin(config.meta?.siteUrl || "", canonical || url || "/");

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
        <meta name="description" content={description || ""} />
        {keywords ||
          config?.keywords && <meta name="keywords" content={keywords || config?.keywords} />}
        {config?.locale && <meta property="og:locale" content={`${config?.locale}`} />}
        <meta property="og:type" content={ogType || config?.ogType} />
        <meta property="og:title" content={ogTitle || titleText || ""} />
        <meta
          property="og:description"
          content={ogDescription || description || config?.description || ""}
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={config?.siteName || ""} />
        {config?.siteUrl &&
          (
            <meta
              property="og:image"
              content={pathJoin(config?.siteUrl, ogImage || config?.ogImage || "")}
            />
          )}
        <meta name="twitter:card" content="summary_large_image" />
        {config?.twitterSite && <meta name="twitter:site" content={config?.twitterSite} />}
        <meta name="twitter:title" content={ogTitle || titleText || ""} />
        <meta
          name="twitter:description"
          content={ogDescription || description || config?.description || ""}
        />
        <link rel="canonical" href={url || ""} />
        {(config?.webFonts?.length > 0) && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            {meta?.webFonts?.map(
              (url: string, i: number) => (
                <link
                  key={`fonts-preload-${i}`}
                  rel="preload"
                  as="style"
                  href={url}
                  fetchPriority="high"
                />
              ),
            )}
            {meta?.webFonts?.map((url: string, i: number) => (
              <link
                key={`fonts-${i}`}
                rel="stylesheet"
                href={url}
                media="print"
                onload='this.media="all"'
              />
            ))}
          </>
        )}
        <Assets />

        {/* tracking tag */}
        {/* {{ __html: ``, }} */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
