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
