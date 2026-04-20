type Preconnect = { href: string; crossOrigin?: boolean };

const KNOWN_PROVIDER_PRECONNECTS: Record<string, Preconnect[]> = {
  "https://fonts.googleapis.com": [
    { href: "https://fonts.googleapis.com" },
    { href: "https://fonts.gstatic.com", crossOrigin: true },
  ],
};

function resolvePreconnects(fonts: string[]): Preconnect[] {
  const seen = new Set<string>();
  const result: Preconnect[] = [];
  for (const url of fonts) {
    const origin = new URL(url).origin;
    const entries = KNOWN_PROVIDER_PRECONNECTS[origin] ?? [{ href: origin, crossOrigin: true }];
    for (const entry of entries) {
      const key = `${entry.href}|${entry.crossOrigin ? 1 : 0}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(entry);
      }
    }
  }
  return result;
}

export default function ({ config, webFonts }: Lume.Data) {
  const fonts = Array.from(
    new Set([
      ...(config?.webFonts ?? []),
      ...(webFonts ?? []),
    ]),
  );
  const preconnects = resolvePreconnects(fonts);

  return (
    <>
      {fonts.length > 0 && (
        <>
          {preconnects.map((pc) => (
            <link
              key={`preconnect:${pc.href}|${pc.crossOrigin ? 1 : 0}`}
              rel="preconnect"
              href={pc.href}
              crossOrigin={pc.crossOrigin ? "" : undefined}
            />
          ))}
          {fonts.map((url) => (
            <link
              key={`preload:${url}`}
              rel="preload"
              as="style"
              href={url}
              fetchPriority="high"
            />
          ))}
          {fonts.map((url) => (
            <link
              key={`stylesheet:${url}`}
              rel="stylesheet"
              href={url}
              media="print"
              // @see https://css-tricks.com/how-to-load-fonts-in-a-way-that-fights-fout-and-makes-lighthouse-happy/#aa-the-optimal-way-to-load-fonts
              onload="this.media='all'"
            />
          ))}
        </>
      )}
      <link rel="stylesheet" href="/assets/main.css" />
      <script type="module" src="/assets/main.js"></script>
    </>
  );
}
