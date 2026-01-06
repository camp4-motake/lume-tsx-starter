import { DOMParser, Element } from "@b-fuze/deno-dom";
import { crypto } from "@std/crypto";
import { dirname, extname, join } from "@std/path";

const __dirname = new URL(".", import.meta.url).pathname;
const distDir = join(__dirname, "../_site");

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
): Promise<string | null> {
  if (!attrValue || attrValue.startsWith("http") || attrValue.startsWith("data:")) {
    return attrValue;
  }

  const [pathOnly] = attrValue.split(/[?#]/);

  const loc = Deno.env.get("SITE_LOCATION") || "/";
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
              const newUrl = await addHashToAttributeValue(htmlFilePath, url);
              return descriptor ? `${newUrl} ${descriptor}` : newUrl;
            }),
          );
          elem.setAttribute(attributeName, newSrcsetParts.join(", "));
        })(),
      );
    } else if (attrValue) {
      promises.push(
        (async () => {
          const newValue = await addHashToAttributeValue(htmlFilePath, attrValue);
          if (newValue && newValue !== attrValue) {
            elem.setAttribute(attributeName, newValue);
          }
        })(),
      );
    }
  }
  await Promise.all(promises);
}

async function processHtmlFile(filePath: string): Promise<void> {
  try {
    const html = await Deno.readTextFile(filePath);
    const document = new DOMParser().parseFromString(html, "text/html");
    if (!document) throw new Error(`Failed to parse HTML from ${filePath}`);

    await Promise.all([
      processElements(
        document as unknown as Document,
        filePath,
        'link[rel="stylesheet"][href]',
        "href",
      ),
      processElements(document as unknown as Document, filePath, "script[src]", "src"),
      processElements(document as unknown as Document, filePath, "img[src]", "src"),
      processElements(document as unknown as Document, filePath, "source[src]", "src"),
      processElements(document as unknown as Document, filePath, "source[srcset]", "srcset"),
      processElements(document as unknown as Document, filePath, "video[src]", "src"),
      processElements(document as unknown as Document, filePath, "video[poster]", "poster"),
      processElements(document as unknown as Document, filePath, "audio[src]", "src"),
    ]);

    // Write the modified HTML back to the file
    const doctype = document.doctype ? `<!DOCTYPE ${document.doctype.name}>` : "";
    await Deno.writeTextFile(filePath, doctype + document.documentElement!.outerHTML);
    console.log(`Processed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

async function processDistDirectory(dir: string): Promise<void> {
  const filePromises: Promise<void>[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const filePath = join(dir, entry.name);

    if (entry.isDirectory) {
      filePromises.push(processDistDirectory(filePath));
    } else if (entry.isFile && extname(entry.name).toLowerCase() === ".html") {
      filePromises.push(processHtmlFile(filePath));
    }
  }
  await Promise.all(filePromises);
}

if (import.meta.main) {
  console.log("Starting cache busting process...");
  const startTime = performance.now();
  await processDistDirectory(distDir).catch(console.error);
  const endTime = performance.now();
  console.log(`Cache busting finished in ${(endTime - startTime).toFixed(2)} ms`);
}
