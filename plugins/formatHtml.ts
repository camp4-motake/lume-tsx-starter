/**
 * formatHtml — 出力 HTML をインデント付きで整形する
 *
 * HTML プロセッサとして page.document を独自シリアライザで再出力し、
 * 可読なインデント付き HTML にする (minify_html の代替)。
 *
 * Ordering: 最後の .html プロセッサとして登録する (cacheBuster より後)
 * Register: site.use(formatHtml()); // _config.ts では FORMAT_HTML=true の本番ビルドのみ
 * Remove:   このファイルと _config.ts の import + 登録ブロックを削除
 */

import type { Element } from "lume/deps/dom.ts";
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

type Options = {
  /** インデント文字列 (default: スペース2つ) */
  indent?: string;
};

export default function formatHtml({ indent = "  " }: Options = {}) {
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const { document } = page;
        if (!document.documentElement) continue;

        const out: string[] = [];
        if (document.doctype) out.push(`<!DOCTYPE ${document.doctype.name}>`);
        serializeElement(document.documentElement as unknown as Element, 0, indent, out);
        page.text = out.join("\n") + "\n";
      }
    });
  };
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
