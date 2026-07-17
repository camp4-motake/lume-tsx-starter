/**
 * cacheBuster — ローカルアセット URL にコンテンツハッシュのクエリを付与する
 *
 * afterBuild で出力 HTML を走査し、css / js / img / source / video / audio / image の
 * ローカル参照 URL に `?v=<md5 先頭8桁>` を付けてブラウザキャッシュを無効化する。
 *
 * Register: site.use(cacheBuster()); // _config.ts では本番ビルドのみ (if (!isDev))
 * Remove:   このファイルと _config.ts の import + 登録ブロックを削除
 * Deps:     @b-fuze/deno-dom, @std/crypto, @std/encoding, @std/fs, @std/path
 */

import { DOMParser, type Element } from "@b-fuze/deno-dom";
import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding/hex";
import { walk } from "@std/fs/walk";
import { dirname, join } from "@std/path";
import type Site from "lume/core/site.ts";

type Options = {
  /** 書き換え対象の要素セレクタと属性 (default: css/js/img/source/video/audio/image) */
  selectors?: ReadonlyArray<{ selector: string; attribute: string }>;
  /** クエリに付与するハッシュの桁数 (default: 8) */
  hashLength?: number;
  /** クエリパラメータ名 (default: "v") */
  paramName?: string;
};

type RewriteContext = {
  htmlFilePath: string;
  distDir: string;
  siteLocation: string;
  hashLength: number;
  paramName: string;
  hashCache: Map<string, string>;
};

const defaultSelectors: ReadonlyArray<{ selector: string; attribute: string }> = [
  { selector: 'link[rel="stylesheet"][href]', attribute: "href" },
  { selector: "script[src]", attribute: "src" },
  { selector: "img[src]", attribute: "src" },
  { selector: "img[srcset]", attribute: "srcset" },
  { selector: "source[src]", attribute: "src" },
  { selector: "source[srcset]", attribute: "srcset" },
  { selector: "video[src]", attribute: "src" },
  { selector: "video[poster]", attribute: "poster" },
  { selector: "audio[src]", attribute: "src" },
  { selector: "image[href]", attribute: "href" },
];

async function hashFile(filePath: string, ctx: RewriteContext): Promise<string | null> {
  const cached = ctx.hashCache.get(filePath);
  if (cached) return cached;

  try {
    const bytes = await Deno.readFile(filePath);
    const digest = await crypto.subtle.digest("MD5", bytes);
    const shortHash = encodeHex(new Uint8Array(digest)).slice(0, ctx.hashLength);
    ctx.hashCache.set(filePath, shortHash);
    return shortHash;
  } catch (error) {
    console.error(`Error generating hash for ${filePath}:`, error);
    return null;
  }
}

function resolveAssetPath(pathOnly: string, ctx: RewriteContext): string {
  return pathOnly.startsWith(ctx.siteLocation)
    ? join(ctx.distDir, pathOnly.slice(ctx.siteLocation.length))
    : join(dirname(ctx.htmlFilePath), pathOnly);
}

async function rewriteUrl(value: string, ctx: RewriteContext): Promise<string> {
  if (value.startsWith("http") || value.startsWith("data:")) return value;

  const [pathOnly] = value.split(/[?#]/);
  const fullPath = resolveAssetPath(pathOnly, ctx);

  try {
    await Deno.stat(fullPath);
  } catch {
    return value;
  }

  const hash = await hashFile(fullPath, ctx);
  return hash ? `${pathOnly}?${ctx.paramName}=${hash}` : value;
}

async function rewriteSrcset(value: string, ctx: RewriteContext): Promise<string> {
  const parts = await Promise.all(
    value.split(",").map(async (item) => {
      const [url, descriptor] = item.trim().split(/\s+/);
      const newUrl = await rewriteUrl(url, ctx);
      return descriptor ? `${newUrl} ${descriptor}` : newUrl;
    }),
  );
  return parts.join(", ");
}

async function rewriteElement(
  elem: Element,
  attribute: string,
  ctx: RewriteContext,
): Promise<void> {
  const current = elem.getAttribute(attribute);
  if (!current) return;

  const next = attribute === "srcset"
    ? await rewriteSrcset(current, ctx)
    : await rewriteUrl(current, ctx);

  if (next !== current) elem.setAttribute(attribute, next);
}

function serializeDocument(document: Document): string {
  const doctype = document.doctype ? `<!DOCTYPE ${document.doctype.name}>` : "";
  return doctype + document.documentElement!.outerHTML;
}

async function processHtmlFile(
  filePath: string,
  selectors: ReadonlyArray<{ selector: string; attribute: string }>,
  base: Omit<RewriteContext, "htmlFilePath">,
) {
  try {
    const html = await Deno.readTextFile(filePath);
    const parsed = new DOMParser().parseFromString(html, "text/html");
    if (!parsed) throw new Error(`Failed to parse HTML from ${filePath}`);
    const document = parsed as unknown as Document;

    const ctx: RewriteContext = { ...base, htmlFilePath: filePath };

    await Promise.all(selectors.map(async ({ selector, attribute }) => {
      const elements = Array.from(document.querySelectorAll(selector)) as unknown as Element[];
      await Promise.all(elements.map((el) => rewriteElement(el, attribute, ctx)));
    }));

    await Deno.writeTextFile(filePath, serializeDocument(document));
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

export default function cacheBuster(
  { selectors = defaultSelectors, hashLength = 8, paramName = "v" }: Options = {},
) {
  return (site: Site) => {
    site.addEventListener("afterBuild", async () => {
      console.log("Starting cache busting process...");
      const startTime = performance.now();
      const distDir = site.dest();
      const siteLocation = site.options.location?.pathname || "/";
      // ビルドごとに作り直す (watch 時に変更済みアセットの古いハッシュを残さない)
      const hashCache = new Map<string, string>();
      const base = { distDir, siteLocation, hashLength, paramName, hashCache };

      const tasks: Promise<void>[] = [];
      for await (const entry of walk(distDir, { includeDirs: false, exts: [".html"] })) {
        tasks.push(processHtmlFile(entry.path, selectors, base));
      }
      await Promise.all(tasks).catch(console.error);

      const endTime = performance.now();
      console.log(`Cache busting finished in ${(endTime - startTime).toFixed(2)} ms`);
    });
  };
}
