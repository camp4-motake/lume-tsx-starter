import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";
import { crypto } from "jsr:@std/crypto";
import { dirname, extname, join } from "jsr:@std/path";

const __dirname = new URL(".", import.meta.url).pathname;
const distDir = join(__dirname, "../_site");

async function generateHash(filePath: string): Promise<string> {
  try {
    const fileBytes = await Deno.readFile(filePath);
    const hashBuffer = await crypto.subtle.digest("MD5", fileBytes);
    // ArrayBufferを16進数文字列に変換
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex.slice(0, 8);
  } catch (error) {
    console.error(`Error generating hash for ${filePath}:`, error);
    return "error";
  }
}

async function addHashToPath(
  filePath: string,
  attrPath: string | null,
): Promise<string | null> {
  if (attrPath && !attrPath.startsWith("http")) {
    const fullPath = join(dirname(filePath), attrPath);
    const hash = await generateHash(fullPath);
    return `${attrPath}?v=${hash}`;
  }
  return attrPath;
}

async function processHtmlFile(filePath: string): Promise<void> {
  const html = await Deno.readTextFile(filePath);
  const document = new DOMParser().parseFromString(html, "text/html");
  if (!document) throw new Error(`Failed to parse HTML from ${filePath}`);

  // Process stylesheets
  const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
  for (let i = 0; i < styleLinks.length; i++) {
    const elem = styleLinks[i] as Element;
    const href = elem.getAttribute("href") || "";
    const newHref = await addHashToPath(filePath, href);
    if (newHref) elem.setAttribute("href", newHref);
  }

  // Process scripts
  const scripts = document.querySelectorAll("script[src]");
  for (let i = 0; i < scripts.length; i++) {
    const elem = scripts[i] as Element;
    const src = elem.getAttribute("src") || "";
    const newSrc = await addHashToPath(filePath, src);
    if (newSrc) elem.setAttribute("src", newSrc);
  }

  // Process images
  const images = document.querySelectorAll("img[src]");
  for (let i = 0; i < images.length; i++) {
    const elem = images[i] as Element;
    const src = elem.getAttribute("src") || "";
    const newSrc = await addHashToPath(filePath, src);
    if (newSrc) elem.setAttribute("src", newSrc);
  }

  // Process source elements
  const sources = document.querySelectorAll("source");
  for (let i = 0; i < sources.length; i++) {
    const elem = sources[i] as Element;

    // Handle src attribute
    const src = elem.getAttribute("src");
    if (src) {
      const newSrc = await addHashToPath(filePath, src);
      if (newSrc) elem.setAttribute("src", newSrc);
    }

    // Handle srcset attribute
    const srcset = elem.getAttribute("srcset");
    if (srcset) {
      const srcsetParts = srcset.split(",");
      const newSrcsetParts = await Promise.all(
        srcsetParts.map(async (srcItem) => {
          const [url, descriptor] = srcItem.trim().split(/\s+/);
          const newUrl = await addHashToPath(filePath, url);
          return descriptor ? `${newUrl} ${descriptor}` : newUrl;
        }),
      );
      elem.setAttribute("srcset", newSrcsetParts.join(", "));
    }
  }

  // Write the modified HTML back to the file
  await Deno.writeTextFile(filePath, document.documentElement!.outerHTML);
  console.log(`Processed: ${filePath}`);
}

async function processDistDirectory(dir: string): Promise<void> {
  for await (const entry of Deno.readDir(dir)) {
    const filePath = join(dir, entry.name);

    if (entry.isDirectory) {
      await processDistDirectory(filePath);
    } else if (entry.isFile && extname(entry.name).toLowerCase() === ".html") {
      await processHtmlFile(filePath);
    }
  }
}

if (import.meta.main) {
  await processDistDirectory(distDir).catch(console.error);
}
