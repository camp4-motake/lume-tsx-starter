import type Site from "lume/core/site.ts";

export default function formatHtml(src = "./_site/**/*.html") {
  return (site: Site) => {
    site.script(
      "formatHtml",
      `deno run --allow-read --allow-write --allow-env npm:js-beautify@latest '${src}' --indent-size 2 --no-preserve-newlines --end-with-newline false --extra-liners "" --unformatted "script,style,svg,noscript" --replace`,
    );
    site.addEventListener("afterBuild", "formatHtml");
  };
}
