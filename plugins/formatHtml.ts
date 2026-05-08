import { DOMParser, type Element } from "@b-fuze/deno-dom";
import { walk } from "@std/fs/walk";
import type Site from "lume/core/site.ts";

const PRESERVE = new Set([
  "script",
  "style",
  "svg",
  "noscript",
  "pre",
  "textarea",
]);

const INLINE = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "img",
  "kbd",
  "label",
  "mark",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
]);

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;

type Options = { indent?: string };

export default function formatHtml({ indent = "  " }: Options = {}) {
  return (site: Site) => {
    site.addEventListener("afterBuild", async () => {
      const distDir = site.dest();
      const tasks: Promise<void>[] = [];
      for await (
        const entry of walk(distDir, { includeDirs: false, exts: [".html"] })
      ) {
        tasks.push(formatFile(entry.path, indent));
      }
      await Promise.all(tasks).catch(console.error);
    });
  };
}

async function formatFile(filePath: string, indent: string): Promise<void> {
  try {
    const html = await Deno.readTextFile(filePath);
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc?.documentElement) return;

    const out: string[] = [];
    if (doc.doctype) out.push(`<!DOCTYPE ${doc.doctype.name}>`);
    serializeElement(doc.documentElement, 0, indent, out);
    await Deno.writeTextFile(filePath, out.join("\n") + "\n");
  } catch (error) {
    console.error(`Error formatting file ${filePath}:`, error);
  }
}

function serializeElement(
  el: Element,
  depth: number,
  indent: string,
  out: string[],
): void {
  const pad = indent.repeat(depth);
  const tag = el.tagName.toLowerCase();

  if (PRESERVE.has(tag) || isInlineOnly(el)) {
    out.push(pad + el.outerHTML);
    return;
  }

  out.push(pad + openTag(el));
  const childPad = indent.repeat(depth + 1);
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === ELEMENT_NODE) {
      serializeElement(node as unknown as Element, depth + 1, indent, out);
    } else if (node.nodeType === TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) out.push(childPad + text);
    } else if (node.nodeType === COMMENT_NODE) {
      const data = (node as unknown as { data: string }).data ?? "";
      out.push(childPad + `<!--${data}-->`);
    }
  }
  out.push(pad + `</${tag}>`);
}

function isInlineOnly(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType !== ELEMENT_NODE) continue;
    const childTag = (node as unknown as Element).tagName.toLowerCase();
    if (!INLINE.has(childTag) && !PRESERVE.has(childTag)) return false;
  }
  return true;
}

function openTag(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const html = (el.cloneNode(false) as unknown as Element).outerHTML;
  const close = `</${tag}>`;
  return html.endsWith(close) ? html.slice(0, -close.length) : html;
}
