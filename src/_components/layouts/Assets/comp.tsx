/**
 * main assets
 */
export default function ({ config, webFonts }: Lume.Data) {
  const fonts = [
    ...(config?.webFonts || []), // global config
    ...(webFonts || []), // page config
  ];

  return (
    <>
      {
        /**
         * google fonts link
         */
      }
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
              onload="this.media='all'" // @see https://css-tricks.com/how-to-load-fonts-in-a-way-that-fights-fout-and-makes-lighthouse-happy/#aa-the-optimal-way-to-load-fonts
            />
          ))}
        </>
      )}
      {
        /**
         * main assets
         *
         * @see https://lume.land/docs/getting-started/working-with-assets/
         * @see https://lume.land/docs/configuration/config-file/
         */
      }
      <link rel="stylesheet" href="/assets/main.css" />
      <script type="module" src="/assets//main.js"></script>
    </>
  );
}
