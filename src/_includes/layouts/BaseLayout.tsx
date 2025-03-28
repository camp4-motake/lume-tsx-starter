type Components = { [K: string]: () => JSX.Element };

interface LayoutProps<T extends Components> {
  comp: T;
  children: JSX.Element;
  title: string;
}

export default function <T extends Components>(
  { children, title }: LayoutProps<T>,
) {
  return (
    <>
      <html lang="ja">
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{title}</title>
          <link rel="stylesheet" href="/assets/main.css" />
          <script type="module" src="/assets//main.js"></script>
        </head>
        <body>
          {children}
        </body>
      </html>
    </>
  );
}
