import { resolve } from "jsr:@std/path";
import AdmZip from "npm:adm-zip";

const zipPrefix = Deno.env.get("ZIP_PREFIX") || "production-build";
const date = new Date().toISOString().slice(0, 10).replace(/-/g, "") + "_" +
  Math.floor(Date.now() / 1000);

console.log("date", date);

try {
  // build site
  const { success: buildSuccess } = await new Deno.Command("deno", {
    args: ["task", "build"],
    stdout: "inherit",
    stderr: "inherit",
  }).output();

  if (!buildSuccess) throw new Error("Build Failed");

  const currentDir = Deno.cwd();
  const zipDirRelative = "./_site";
  const zipDir = resolve(currentDir, zipDirRelative);

  // zip
  const zip = new AdmZip();
  zip.addLocalFolder(zipDir);
  zip.writeZip(`./_zip/${zipPrefix}-${date}.zip`);

  console.log("ZIP file generation succeeded");
} catch (error) {
  console.error("Error:", error);
  Deno.exit(1);
}
