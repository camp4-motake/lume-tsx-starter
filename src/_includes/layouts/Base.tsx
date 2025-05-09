export default function ({ children, comp, title }: Lume.Data) {
  return (
    <>
      <html lang="ja">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{title}</title>
          <comp.Assets />
        </head>
        <body>
          {children}
        </body>
      </html>
    </>
  );
}
