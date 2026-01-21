import { DOMParser, Element } from "@b-fuze/deno-dom";
import { crypto } from "@std/crypto";
import { dirname, extname, join } from "@std/path";
import type Site from "lume/core/site.ts";

const hashCache = new Map<string, string>();

async function generateHashCached(filePath: string): Promise<string> {
  if (hashCache.has(filePath)) {
    return hashCache.get(filePath)!;
  }

  try {
    const fileBytes = await Deno.readFile(filePath);
    const hashBuffer = await crypto.subtle.digest("MD5", fileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const shortHash = hashHex.slice(0, 8);
    hashCache.set(filePath, shortHash);
    return shortHash;
  } catch (error) {
    console.error(`Error generating hash for ${filePath}:`, error);
    hashCache.set(filePath, "error");
    return "error";
  }
}

async function addHashToAttributeValue(
  htmlFilePath: string,
  attrValue: string | null,
  distDir: string,
  siteLocation: string,
): Promise<string | null> {
  if (!attrValue || attrValue.startsWith("http") || attrValue.startsWith("data:")) {
    return attrValue;
  }

  const [pathOnly] = attrValue.split(/[?#]/);

  const loc = siteLocation;
  const fullPath = pathOnly.startsWith(loc)
    ? join(distDir, pathOnly.slice(loc.length))
    : join(dirname(htmlFilePath), pathOnly);

  try {
    await Deno.stat(fullPath);
  } catch {
    return attrValue;
  }

  const hash = await generateHashCached(fullPath);

  if (hash === "error") {
    return attrValue;
  }

  return `${pathOnly}?v=${hash}`;
}

async function processElements(
  document: Document,
  htmlFilePath: string,
  selector: string,
  attributeName: string,
  distDir: string,
  siteLocation: string,
): Promise<void> {
  const elements = document.querySelectorAll(selector);
  const promises: Promise<void>[] = [];

  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i] as unknown as Element;
    const attrValue = elem.getAttribute(attributeName);

    if (attributeName === "srcset" && attrValue) {
      promises.push(
        (async () => {
          const srcsetParts = attrValue.split(",");
          const newSrcsetParts = await Promise.all(
            srcsetParts.map(async (srcItem) => {
              const [url, descriptor] = srcItem.trim().split(/\s+/);
              const newUrl = await addHashToAttributeValue(
                htmlFilePath,
                url,
                distDir,
                siteLocation,
              );
              return descriptor ? `${newUrl} ${descriptor}` : newUrl;
            }),
          );
          elem.setAttribute(attributeName, newSrcsetParts.join(", "));
        })(),
      );
    } else if (attrValue) {
      promises.push(
        (async () => {
          const newValue = await addHashToAttributeValue(
            htmlFilePath,
            attrValue,
            distDir,
            siteLocation,
          );
          if (newValue && newValue !== attrValue) {
            elem.setAttribute(attributeName, newValue);
          }
        })(),
      );
    }
  }
  await Promise.all(promises);
}

async function processHtmlFile(
  filePath: string,
  distDir: string,
  siteLocation: string,
): Promise<void> {
  try {
    const html = await Deno.readTextFile(filePath);
    const document = new DOMParser().parseFromString(html, "text/html");
    if (!document) throw new Error(`Failed to parse HTML from ${filePath}`);

    // [selector, attributeName]
    const targets = [
      ['link[rel="stylesheet"][href]', "href"],
      ["script[src]", "src"],
      ["img[src]", "src"],
      ["source[src]", "src"],
      ["source[srcset]", "srcset"],
      ["video[src]", "src"],
      ["video[poster]", "poster"],
      ["audio[src]", "src"],
    ];

    await Promise.all(targets.map(([selector, attributeName]) =>
      processElements(
        document as unknown as Document,
        filePath,
        selector,
        attributeName,
        distDir,
        siteLocation,
      )
    ));

    // Write the modified HTML back to the file
    const doctype = document.doctype ? `<!DOCTYPE ${document.doctype.name}>` : "";
    await Deno.writeTextFile(filePath, doctype + document.documentElement!.outerHTML);
    // console.log(`Processed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

async function processDistDirectory(
  dir: string,
  distDir: string,
  siteLocation: string,
): Promise<void> {
  const filePromises: Promise<void>[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const filePath = join(dir, entry.name);

    if (entry.isDirectory) {
      filePromises.push(processDistDirectory(filePath, distDir, siteLocation));
    } else if (entry.isFile && extname(entry.name).toLowerCase() === ".html") {
      filePromises.push(processHtmlFile(filePath, distDir, siteLocation));
    }
  }
  await Promise.all(filePromises);
}

export default function cacheBuster() {
  return (site: Site) => {
    site.addEventListener("afterBuild", async () => {
      console.log("Starting cache busting process...");
      const startTime = performance.now();
      const distDir = site.dest();
      const siteLocation = site.options.location?.pathname || "/";
      await processDistDirectory(distDir, distDir, siteLocation).catch(console.error);
      const endTime = performance.now();
      console.log(`Cache busting finished in ${(endTime - startTime).toFixed(2)} ms`);
    });
  };
}
