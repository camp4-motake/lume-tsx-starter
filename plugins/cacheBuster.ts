/**
 * cacheBuster — ローカルアセット URL にコンテンツハッシュのクエリを付与する
 *
 * HTML プロセッサとして page.document を直接書き換え、css / js / img / source /
 * video / audio / image のローカル参照 URL に `?v=<md5 先頭8桁>` を付けて
 * ブラウザキャッシュを無効化する。既存のクエリ / フラグメントは保持する。
 *
 * Ordering: アセットを確定させるプロセッサ (esbuild / lightningcss / transformImages /
 *           base_path など) より後、minify_html / formatHtml より前に登録する。
 *           minify_html の対象を .css / .js に広げるとハッシュ後にバイトが変わるため不可。
 * Register: site.use(cacheBuster()); // _config.ts では本番ビルドのみ (if (!isDev))
 * Remove:   このファイルと _config.ts の import + 登録ブロックを削除
 */

import binaryLoader from "lume/core/loaders/binary.ts";
import { md5 } from "lume/core/utils/digest.ts";
import { parseSrcset } from "lume/core/utils/dom_links.ts";
import { posix } from "lume/deps/path.ts";
import type { Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";

type Options = {
  /** 書き換え対象の要素セレクタと属性 (default: css/js/img/source/video/audio/image) */
  selectors?: ReadonlyArray<{ selector: string; attribute: string }>;
  /** クエリに付与するハッシュの桁数 (default: 8) */
  hashLength?: number;
  /** クエリパラメータ名 (default: "v") */
  paramName?: string;
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

/** `https:` などのスキーム付きとプロトコル相対 (`//`) は対象外 */
const EXTERNAL_URL = /^[a-z][\w+.-]*:|^\/\//i;

export default function cacheBuster(
  { selectors = defaultSelectors, hashLength = 8, paramName = "v" }: Options = {},
) {
  return (site: Site) => {
    site.process([".html"], async (pages, allPages) => {
      const basePath = site.options.location.pathname.replace(/\/+$/, "");

      const assetPages = new Map<string, Page>();
      for (const page of allPages) {
        if (!page.isHTML) assetPages.set(page.data.url, page);
      }
      const staticFiles = new Map(site.files.map((file) => [file.data.url, file]));

      // watch 時に古いハッシュを残さないよう、実行ごとに作り直す
      const hashes = new Map<string, Promise<string | null>>();

      const hashOf = (url: string): Promise<string | null> => {
        let hash = hashes.get(url);
        if (!hash) {
          hash = computeHash(url);
          hashes.set(url, hash);
        }
        return hash;
      };

      const computeHash = async (url: string): Promise<string | null> => {
        const page = assetPages.get(url);
        if (page) return (await md5(page.bytes)).slice(0, hashLength);

        // site.copy のファイルは無変換で出力されるためソースのバイトで代用できる
        const file = staticFiles.get(url);
        if (!file) return null;
        const { content } = await file.src.entry.getContent(binaryLoader);
        return (await md5(content as Uint8Array)).slice(0, hashLength);
      };

      const bust = async (value: string, page: Page): Promise<string> => {
        if (EXTERNAL_URL.test(value)) return value;

        const hashIndex = value.indexOf("#");
        const fragment = hashIndex === -1 ? "" : value.slice(hashIndex);
        const rest = hashIndex === -1 ? value : value.slice(0, hashIndex);
        const queryIndex = rest.indexOf("?");
        const query = queryIndex === -1 ? "" : rest.slice(queryIndex);
        const path = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
        if (!path) return value;

        // 絶対パスは base_path が付けた location.pathname を剥がし、相対パスはページ基準で解決
        const url = path.startsWith("/")
          ? basePath && path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path
          : posix.join(posix.dirname(page.outputPath), path);

        const hash = await hashOf(url);
        if (!hash) return value;
        return `${path}${query ? `${query}&` : "?"}${paramName}=${hash}${fragment}`;
      };

      for (const page of pages) {
        for (const { selector, attribute } of selectors) {
          for (const element of page.document.querySelectorAll(selector)) {
            const value = element.getAttribute(attribute);
            if (!value) continue;

            const next = attribute === "srcset"
              ? (await Promise.all(
                parseSrcset(value).map(async ([url, rest]) => await bust(url, page) + rest),
              )).join(", ")
              : await bust(value, page);

            if (next !== value) element.setAttribute(attribute, next);
          }
        }
      }
    });
  };
}
