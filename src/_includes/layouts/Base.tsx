export default function (
  data: Lume.Data,
  helpers: Lume.Helpers,
) {
  const { children, comp, config, lang } = data;
  const { Assets } = comp.layouts;
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

        <Assets />

        {/* tracking tag */}
        {{ __html: "" }}

        {titleText && <meta property="og:title" content={titleText} />}
      </head>
      <body>
        {/* tracking tag (noscript) */}
        {{ __html: "" }}

        {children}

        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "prerender": [{
                "where": {
                  "and": [
                    { "href_matches": "/*" },
                    { "not": { "selector_matches": "[rel~='nofollow']" } },
                    { "not": { "selector_matches": ["[data-no-prerender]"] } },
                    // { "not": { "href_matches": ["/wp-*", "/*\\?(.+)"] } },
                  ],
                },
                "eagerness": "moderate",
              }],
            }),
          }}
        >
        </script>
      </body>
    </html>
  );
}
