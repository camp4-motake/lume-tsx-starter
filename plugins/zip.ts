/**
 * zip — _site/ を zip 化するスタンドアロン CLI (Lume プラグインではない)
 *
 * `_site/` を `_zip/<ZIP_PREFIX>-<timestamp>.zip` に圧縮する。ビルドは package.json の
 * "zip" スクリプトが先に実行する。site.use() には登録しない。
 *
 * Run:    pnpm zip
 * Env:    ZIP_PREFIX — zip ファイル名の接頭辞 (default: "production-build")
 * Remove: このファイルと package.json の "zip" スクリプトを削除
 * Deps:   adm-zip
 */

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import AdmZip from "adm-zip";

const ZIP_PREFIX = process.env.ZIP_PREFIX || "production-build";
const SITE_DIR = "./_site";
const OUTPUT_DIR = "./_zip";

function buildTimestamp(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const epoch = Math.floor(now.getTime() / 1000);
  return `${date}_${epoch}`;
}

async function createZip(sourceDir: string, outputPath: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  zip.writeZip(outputPath);
}

const sourceDir = resolve(SITE_DIR);
const outputPath = resolve(OUTPUT_DIR, `${ZIP_PREFIX}-${buildTimestamp()}.zip`);

await createZip(sourceDir, outputPath);

console.log(`ZIP file generated: ${outputPath}`);
