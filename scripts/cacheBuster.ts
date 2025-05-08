import { existsSync } from "jsr:@std/fs";
import { join, parse } from "jsr:@std/path";
import type Site from "lume/core/site.ts";

export interface CacheBusterOptions {
  /** Method to generate the cache buster (default: "timestamp") */
  method?: "timestamp" | "hash" | "random";

  /** Length of the hash value (default: 8) */
  hashLength?: number;

  /** Name of the cache buster query parameter (default: "v") */
  paramName?: string;

  /** File types to which cache buster query parameter will be added */
  extensions?: string[];

  /** Selectors and attributes in HTML to which cache buster will be applied */
  selectors?: Record<string, string[]>;
}

/**
 * Lume plugin to add cache busters (query parameters) to static asset URLs
 *
 * @param options Plugin options
 * @returns Lume plugin function
 */
export default function cacheBuster(options: CacheBusterOptions = {}) {
  const {
    method = "hash",
    hashLength = 8,
    paramName = "v",
    extensions = [".css", ".js", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".avif", ".mp4"],
    selectors = {
      "link[rel='stylesheet']": ["href"],
      "script": ["src"],
      "img": ["src", "srcset"],
      "source": ["src", "srcset"],
      "video": ["src", "poster"],
      "audio": ["src"],
    },
  } = options;

  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const { document } = page;

        for (const [selector, attributes] of Object.entries(selectors)) {
          const elements = document.querySelectorAll(selector);

          for (const element of elements) {
            for (const attribute of attributes) {
              processAttribute(element, attribute, site);
            }
          }
        }
      }
    });

    /**
     * Add cache buster to the attribute URL of an element
     */
    function processAttribute(element: Element, attribute: string, site: Site) {
      if (attribute === "srcset") {
        const srcset = element.getAttribute("srcset");
        if (!srcset) return;

        const updatedSrcset = processSrcSet(srcset, site);
        element.setAttribute("srcset", updatedSrcset);
        return;
      }

      const url = element.getAttribute(attribute);
      if (!url) return;

      if (
        url.startsWith("http://") || url.startsWith("https://") ||
        url.startsWith("//") || url.startsWith("data:") || url.startsWith("#")
      ) {
        return;
      }

      if (url.includes("?") && url.includes(`${paramName}=`)) {
        return;
      }

      const { ext } = parse(url);
      if (!extensions.includes(ext)) {
        return;
      }

      const cacheBusterValue = getCacheBusterValue(url, site);

      const separator = url.includes("?") ? "&" : "?";
      const newUrl = `${url}${separator}${paramName}=${cacheBusterValue}`;

      element.setAttribute(attribute, newUrl);
    }

    /**
     * Process srcset attribute
     */
    function processSrcSet(srcset: string, site: Site): string {
      return srcset.split(",").map((part) => {
        const [url, descriptor] = part.trim().split(/\s+/);

        if (
          url.startsWith("http://") || url.startsWith("https://") ||
          url.startsWith("//") || url.startsWith("data:") || url.startsWith("#")
        ) {
          return part;
        }

        if (url.includes("?") && url.includes(`${paramName}=`)) {
          return part;
        }

        const { ext } = parse(url);
        if (!extensions.includes(ext)) {
          return part;
        }

        const cacheBusterValue = getCacheBusterValue(url, site);

        const separator = url.includes("?") ? "&" : "?";
        const newUrl = `${url}${separator}${paramName}=${cacheBusterValue}`;

        return descriptor ? `${newUrl} ${descriptor}` : newUrl;
      }).join(", ");
    }

    /**
     * Get cache buster value
     */
    function getCacheBusterValue(url: string, site: Site): string {
      const filePath = url.startsWith("/")
        ? join(site.options.location.root, site.options.dest, url)
        : site.src(url);

      if (!existsSync(filePath)) {
        return getRandomValue();
      }

      try {
        switch (method) {
          case "hash":
            return getFileHash(filePath);
          case "timestamp":
            return getFileTimestamp(filePath);
          case "random":
          default:
            return getRandomValue();
        }
      } catch (error) {
        console.warn(`Cache buster: Error processing file ${url}`, error);
        return getRandomValue();
      }
    }

    /**
     * Get file timestamp
     */
    function getFileTimestamp(filePath: string): string {
      const stat = Deno.statSync(filePath);
      return Math.floor(stat.mtime?.getTime() || Date.now()).toString();
    }

    /**
     * Calculate hash value from file contents (synchronous)
     */
    function getFileHash(filePath: string): string {
      const fileContent = Deno.readFileSync(filePath);

      let hash = 0;
      for (let i = 0; i < fileContent.length; i++) {
        const byte = fileContent[i];
        hash = ((hash << 5) - hash) + byte;
      }

      const hashHex = (hash >>> 0).toString(16);

      return hashHex.padStart(hashLength, "0").substring(0, hashLength);
    }

    /**
     * Generate a random value
     */
    function getRandomValue(): string {
      return Math.floor(Math.random() * 10000000).toString().padStart(8, "0");
    }
  };
}
