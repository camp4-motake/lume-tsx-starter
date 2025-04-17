export default function ({ children }: Lume.Data) {
  return (
    <>
      <html lang="ja">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Document</title>
          <link rel="stylesheet" href="/assets/main.css" />
          <link rel="stylesheet" href="/assets/components.css" />
          <script type="module" src="/assets/main.js"></script>
          <script type="module" src="/assets/components.js"></script>
        </head>
        <body>
          {children}
        </body>
      </html>
    </>
  );
}
