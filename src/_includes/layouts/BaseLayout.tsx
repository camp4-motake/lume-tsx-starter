import { WebFontsLink } from "../../_data/metadata.ts";

export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const {
    canonical,
    description,
    keywords,
    metadata,
    ogImage,
    ogTitle,
    ogType,
    ogDescription,
    title,
    siteTitle,
    siteName,
    url,
    children,
  } = data;

  const { pathJoin } = helpers;

  const titleText: string | undefined = title && url !== "/index.html"
    ? `${title} | ${siteTitle || metadata?.siteTitle}`
    : siteTitle || metadata?.siteTitle;

  const canonicalUrl = pathJoin(metadata?.siteUrl || "", canonical || url || "/");

  return (
    <html lang={metadata?.lang || "ja"}>
      <head>
        <meta charSet={metadata?.encoding || "utf-8"} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="format-detection" content="telephone=no" />
        <title>{titleText}</title>
        <meta name="description" content={description || metadata?.description || ""} />
        <meta name="keywords" content={(keywords as string) || metadata?.keywords || ""} />
        <meta property="og:locale" content={`${metadata.locale}`} />
        <meta property="og:type" content={ogType || "article"} />
        <meta property="og:title" content={ogTitle || titleText || ""} />
        <meta
          property="og:description"
          content={ogDescription || description || metadata?.description || ""}
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteName || metadata?.siteName || ""} />
        {metadata?.siteUrl &&
          (
            <meta
              property="og:image"
              content={pathJoin(metadata?.siteUrl, ogImage || metadata?.ogImage || "")}
            />
          )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle || titleText || ""} />
        <meta name="twitter:description" content={description || metadata?.description || ""} />
        {metadata?.twitterSite && <meta name="twitter:site" content={metadata?.twitterSite} />}
        <link rel="canonical" href={canonicalUrl} />
        {metadata?.webFonts?.length > 0 && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          </>
        )}
        {metadata?.webFonts?.map(
          (url: WebFontsLink) =>
            url?.path && (
              <link
                key={`fonts-preload-${url?.key}`}
                rel="preload"
                as="style"
                href={url?.path}
                fetchPriority="high"
              />
            ),
        )}
        {metadata?.webFonts?.map(
          (url: WebFontsLink) =>
            url?.path && <link key={`fonts-${url?.key}`} rel="stylesheet" href={url?.path} />,
        )}

        <link rel="stylesheet" href="/assets/main.css" />
        {/* <link rel="stylesheet" href="/assets/components.css" /> */}
        <script type="module" src="/assets//main.js"></script>
        {/* <script type="module" src="/assets//components.js"></script> */}
      </head>
      <body transform-images="avif webp">
        {children as React.ReactNode}
      </body>
    </html>
  );
}
