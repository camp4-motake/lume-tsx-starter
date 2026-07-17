/**
 * zip — ビルドして _site/ を zip 化するスタンドアロン CLI (Lume プラグインではない)
 *
 * `deno task build` を実行し、`_site/` を `_zip/<ZIP_PREFIX>-<timestamp>.zip` に圧縮する。
 * site.use() には登録せず、deno task から直接実行する。
 *
 * Run:    deno task zip
 * Env:    ZIP_PREFIX — zip ファイル名の接頭辞 (default: "production-build")
 * Remove: このファイルと deno.json の "zip" タスクを削除
 * Deps:   @std/fs, @std/path, adm-zip
 */

import { dirname, resolve } from "@std/path";
import { ensureDir } from "@std/fs";
import AdmZip from "adm-zip";

const ZIP_PREFIX = Deno.env.get("ZIP_PREFIX") || "production-build";
const SITE_DIR = "./_site";
const OUTPUT_DIR = "./_zip";

function buildTimestamp(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const epoch = Math.floor(now.getTime() / 1000);
  return `${date}_${epoch}`;
}

async function runBuild(): Promise<void> {
  const { success } = await new Deno.Command("deno", {
    args: ["task", "build"],
    stdout: "inherit",
    stderr: "inherit",
  }).output();

  if (!success) throw new Error("Build Failed");
}

async function createZip(sourceDir: string, outputPath: string): Promise<void> {
  await ensureDir(dirname(outputPath));
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  zip.writeZip(outputPath);
}

try {
  await runBuild();

  const cwd = Deno.cwd();
  const sourceDir = resolve(cwd, SITE_DIR);
  const outputPath = resolve(cwd, OUTPUT_DIR, `${ZIP_PREFIX}-${buildTimestamp()}.zip`);

  await createZip(sourceDir, outputPath);

  console.log(`ZIP file generated: ${outputPath}`);
} catch (error) {
  console.error("Error:", error);
  Deno.exit(1);
}
