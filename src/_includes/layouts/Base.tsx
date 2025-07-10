export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const {
    canonical,
    description,
    keywords,
    meta,
    ogImage,
    ogTitle,
    ogType,
    ogDescription,
    title,
    siteTitle,
    siteName,
    url,
    children,
    // comp,
  } = data;
  const { pathJoin } = helpers;
  // const {} = comp;

  const titleText: string | undefined = `${title} | ${siteTitle || meta?.siteTitle}`;
  const canonicalUrl = pathJoin(meta?.siteUrl || "", canonical || url || "/");

  return (
    <html lang={meta?.lang || "ja"}>
      <head>
        <meta charSet={meta?.encoding || "utf-8"} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="format-detection" content="telephone=no" />
        <title>{titleText}</title>
        <meta name="description" content={description || meta?.description || ""} />
        {(keywords || meta?.keywords) &&
          <meta name="keywords" content={keywords || meta?.keywords} />}
        <meta property="og:locale" content={`${meta?.locale}`} />
        <meta property="og:type" content={ogType || meta.ogType} />
        <meta property="og:title" content={ogTitle || titleText || ""} />
        <meta
          property="og:description"
          content={ogDescription || description || meta?.description || ""}
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteName || meta?.siteName || ""} />
        {meta?.siteUrl &&
          (
            <meta
              property="og:image"
              content={pathJoin(meta?.siteUrl, ogImage || meta?.ogImage || "")}
            />
          )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle || titleText || ""} />
        <meta name="twitter:description" content={description || meta?.description || ""} />
        {meta?.twitterSite && <meta name="twitter:site" content={meta?.twitterSite} />}
        <link rel="canonical" href={canonicalUrl} />
        {(meta?.webFonts?.length > 0) && (
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
        <link rel="stylesheet" href="/assets/main.css" />
        <link rel="stylesheet" href="/assets/components.css" />
        <script type="module" src="/assets//main.js"></script>
        <script type="module" src="/assets//components.js"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
