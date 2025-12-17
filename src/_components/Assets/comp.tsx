/**
 * main assets
 */
export default function ({ config, webFonts }: Lume.Data) {
  const fonts = [...(config?.webFonts || []), ...(webFonts || [])];

  return (
    <>
      {/* google fonts */}
      {fonts.length > 0 && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          {fonts.map((url: string, i: number) => (
            <link
              key={`fonts-preload-${i}`}
              rel="preload"
              as="style"
              href={url}
              fetchPriority="high"
            />
          ))}
          {fonts.map((url: string, i: number) => (
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

      {/* main assets */}
      <link rel="stylesheet" href="/assets/main.css" />
      <script type="module" src="/assets//main.js"></script>
    </>
  );
}
