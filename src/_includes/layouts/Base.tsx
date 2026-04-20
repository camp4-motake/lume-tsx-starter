export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const { children, comp, config, lang } = data;
  const { Assets, Header, Footer } = comp.layouts;
  const { url: urlHelper } = helpers;

  const titleText = [!data?.isHome && data?.title, config.siteTitle, data?.isHome && data?.tagline]
    .filter(Boolean)
    .join(" | ");

  const canonicalUrl = urlHelper(data?.url, true);

  return (
    <html lang={lang || config.lang || "ja"}>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="format-detection" content="telephone=no" />
        <title>{titleText}</title>

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
