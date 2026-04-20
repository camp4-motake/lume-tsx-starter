import { DOMParser, type Element } from "@b-fuze/deno-dom";
import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding/hex";
import { walk } from "@std/fs/walk";
import { dirname, join } from "@std/path";
import type Site from "lume/core/site.ts";

type RewriteContext = {
  htmlFilePath: string;
  distDir: string;
  siteLocation: string;
};

const targetSelectors: ReadonlyArray<{ selector: string; attribute: string }> = [
  { selector: 'link[rel="stylesheet"][href]', attribute: "href" },
  { selector: "script[src]", attribute: "src" },
  { selector: "img[src]", attribute: "src" },
  { selector: "source[src]", attribute: "src" },
  { selector: "source[srcset]", attribute: "srcset" },
  { selector: "video[src]", attribute: "src" },
  { selector: "video[poster]", attribute: "poster" },
  { selector: "audio[src]", attribute: "src" },
];

const hashCache = new Map<string, string>();

async function hashFile(filePath: string): Promise<string | null> {
  const cached = hashCache.get(filePath);
  if (cached) return cached;

  try {
    const bytes = await Deno.readFile(filePath);
    const digest = await crypto.subtle.digest("MD5", bytes);
    const shortHash = encodeHex(new Uint8Array(digest)).slice(0, 8);
    hashCache.set(filePath, shortHash);
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

  const hash = await hashFile(fullPath);
  return hash ? `${pathOnly}?v=${hash}` : value;
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

async function processHtmlFile(filePath: string, distDir: string, siteLocation: string) {
  try {
    const html = await Deno.readTextFile(filePath);
    const parsed = new DOMParser().parseFromString(html, "text/html");
    if (!parsed) throw new Error(`Failed to parse HTML from ${filePath}`);
    const document = parsed as unknown as Document;

    const ctx: RewriteContext = { htmlFilePath: filePath, distDir, siteLocation };

    await Promise.all(targetSelectors.map(async ({ selector, attribute }) => {
      const elements = Array.from(document.querySelectorAll(selector)) as unknown as Element[];
      await Promise.all(elements.map((el) => rewriteElement(el, attribute, ctx)));
    }));

    await Deno.writeTextFile(filePath, serializeDocument(document));
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

export default function cacheBuster() {
  return (site: Site) => {
    site.addEventListener("afterBuild", async () => {
      console.log("Starting cache busting process...");
      const startTime = performance.now();
      const distDir = site.dest();
      const siteLocation = site.options.location?.pathname || "/";

      const tasks: Promise<void>[] = [];
      for await (const entry of walk(distDir, { includeDirs: false, exts: [".html"] })) {
        tasks.push(processHtmlFile(entry.path, distDir, siteLocation));
      }
      await Promise.all(tasks).catch(console.error);

      const endTime = performance.now();
      console.log(`Cache busting finished in ${(endTime - startTime).toFixed(2)} ms`);
    });
  };
}
