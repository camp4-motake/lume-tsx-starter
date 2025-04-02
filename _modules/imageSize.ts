import { walk } from "@std/fs/walk";
import { dirname, isAbsolute, join } from "@std/path";
import { DOMParser, Element, HTMLDocument } from "jsr:@b-fuze/deno-dom";
import { imageSizeFromFile } from "npm:image-size@2.0.1/fromFile"; // Use the specified version

const siteDir = "_site";

async function processHtmlFile(filePath: string): Promise<void> {
  try {
    const htmlContent = await Deno.readTextFile(filePath);
    const doc: HTMLDocument | null = new DOMParser().parseFromString(htmlContent, "text/html");

    if (!doc) {
      console.warn(`Failed to parse HTML: ${filePath}`);
      return;
    }

    const images = doc.querySelectorAll("img");
    let modified = false;

    for (const img of images) {
      const element = img as Element; // Cast to Element
      const src = element.getAttribute("src");
      const widthAttr = element.getAttribute("width");
      const heightAttr = element.getAttribute("height");

      // Skip if src is missing, absolute, data URI, or already has dimensions
      if (
        !src || widthAttr || heightAttr || src.startsWith("http:") || src.startsWith("https:") ||
        src.startsWith("data:")
      ) {
        continue;
      }

      // Construct the absolute path to the image file
      // Assuming src is relative to the site root (_site).
      let imagePath: string;
      if (src.startsWith("/")) {
        // Path is relative to the site root
        imagePath = join(siteDir, src);
      } else if (isAbsolute(src)) {
        // Absolute path (should generally not happen for local files in web context)
        // Or could be a file:// URI, handle if necessary
        console.warn(`Skipping absolute src: ${src} in ${filePath}`);
        continue;
      } else {
        // Path is relative to the HTML file's directory
        const htmlDir = dirname(filePath);
        imagePath = join(htmlDir, src);
      }

      try {
        // Ensure the path exists before attempting to read
        await Deno.stat(imagePath);
        const dimensions = await imageSizeFromFile(imagePath);

        if (dimensions && dimensions.width && dimensions.height) {
          element.setAttribute("width", String(dimensions.width));
          element.setAttribute("height", String(dimensions.height));
          console.log(
            `Added size to ${src} in ${filePath}: ${dimensions.width}x${dimensions.height}`,
          );
          modified = true;
        } else {
          console.warn(`Could not get dimensions for ${src} (${imagePath}) in ${filePath}`);
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          console.warn(`Image not found: ${imagePath} (referenced in ${filePath})`);
        } else if (error instanceof Error) { // Check if error is an instance of Error
          console.error(`Error processing image ${imagePath} in ${filePath}:`, error.message);
        } else {
          console.error(
            `An unexpected error occurred while processing image ${imagePath} in ${filePath}:`,
            error,
          );
        }
      }
    }

    if (modified) {
      // Ensure proper serialization, especially for full HTML documents
      const outputHtml = doc.documentElement?.outerHTML;
      if (outputHtml) {
        // Prepend doctype if it was present
        const doctypeRegex = /^\s*<!doctype html>/i;
        const hasDoctype = doctypeRegex.test(htmlContent);
        const finalHtml = hasDoctype ? `<!DOCTYPE html>\n${outputHtml}` : outputHtml;
        await Deno.writeTextFile(filePath, finalHtml);
        console.log(`Updated ${filePath}`);
      } else {
        console.warn(`Could not serialize updated HTML for ${filePath}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) { // Check if error is an instance of Error
      console.error(`Error processing file ${filePath}:`, error.message);
    } else {
      console.error(`An unexpected error occurred while processing file ${filePath}:`, error);
    }
  }
}

async function addImageDimensions(): Promise<void> {
  console.log(`Starting image dimension processing in ${siteDir}...`);
  try {
    // Check if _site directory exists
    await Deno.stat(siteDir);

    for await (const entry of walk(siteDir, { includeDirs: false, exts: [".html"] })) {
      await processHtmlFile(entry.path);
    }
    console.log("Image dimension processing finished.");
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.warn(
        `Directory not found: ${siteDir}. Skipping image dimension processing. Run 'deno task build' first?`,
      );
    } else if (error instanceof Error) { // Check if error is an instance of Error
      console.error("Error walking through site directory:", error.message);
    } else {
      console.error("An unexpected error occurred while walking through site directory:", error);
    }
  }
}

// Run the function if this script is executed directly
if (import.meta.main) {
  await addImageDimensions();
}

// Export the function for potential use in other scripts (e.g., Lume build process)
export { addImageDimensions };
