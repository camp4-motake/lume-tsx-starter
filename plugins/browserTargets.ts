/**
 * browserTargets — browserslist クエリを esbuild / lightningcss のターゲットへ変換する
 *
 * Lume の esbuild / lightningcss プラグインは Baseline 由来の内蔵デフォルト
 * (chrome107 / safari16 など)をターゲットにする。ここでビルド時に
 * browserslist クエリを解決し、両プラグインへ渡せる形式に変換する。
 * 解決結果は deno.lock に固定された caniuse-lite のデータに依存するため、
 * シェア変動へ追随するには定期的な依存更新が必要。
 *
 * Ordering: なし(Lume プラグインではなく純粋モジュール)
 * Register: esbuild({ options: { target: jsTargets } }) /
 *           lightningCss({ options: { targets: cssTargets } })
 * Remove:   このファイルと _config.ts の import + 両プラグインへのオプション指定を削除
 */

import browserslist from "browserslist";
// Lume がピン留めしている lightningcss-wasm と同じ実体を使う
import { browserslistToTargets, type Targets } from "lume/deps/lightningcss.ts";

export const BROWSERS = "> 0.5% in JP and last 2 years and not dead";

const resolved = browserslist(BROWSERS);

const targets: Record<string, number> = { ...browserslistToTargets(resolved) };
// lightningcss-wasm 1.32 の browserslistToTargets は and_chr → chrome などの
// 名前マッピングを定義しながら適用しないため、Targets に無いキーが混入する。
// ここで同名マッピングを適用し直す(バージョンは低い方を採用)
for (
  const [from, to] of [
    ["and_chr", "chrome"],
    ["and_ff", "firefox"],
    ["ie_mob", "ie"],
    ["op_mob", "opera"],
  ] as const
) {
  const version = targets[from];
  if (version != null) {
    targets[to] = targets[to] == null ? version : Math.min(targets[to], version);
    delete targets[from];
  }
}
// Lume の merge() はキー単位の深マージで、渡さないキーには内蔵デフォルト
// (古いバージョン)が残ってしまう。クエリ結果に無いキーは同系エンジンの
// 値で埋めて、意図しない古いターゲットへの巻き戻りを防ぐ。
for (
  const [key, from] of [
    ["android", "chrome"],
    ["edge", "chrome"],
    ["ios_saf", "safari"],
    ["safari", "ios_saf"],
  ] as const
) {
  targets[key] ??= targets[from];
}

/** lightningCss({ options: { targets } }) に渡す */
export const cssTargets: Targets = targets;

// caniuse 名 → esbuild ターゲット名。載っていないもの(samsung, op_mob など)は
// esbuild が受け付けないためスキップする
const ESBUILD_NAMES: Record<string, string> = {
  chrome: "chrome",
  and_chr: "chrome",
  edge: "edge",
  firefox: "firefox",
  and_ff: "firefox",
  safari: "safari",
  ios_saf: "ios",
  opera: "opera",
  ie: "ie",
};

function toEsbuildTargets(list: string[]): string[] {
  const min = new Map<string, number[]>();
  const compare = (a: number[], b: number[]) => {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const diff = (a[i] ?? 0) - (b[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  };
  for (const entry of list) {
    const [name, range] = entry.split(" ");
    const target = ESBUILD_NAMES[name];
    if (!target) continue;
    // "16.6-16.7" のような範囲は下限を採用。"TP" など非数値はスキップ
    const version = range.split("-")[0].split(".").map(Number);
    if (version.some(Number.isNaN)) continue;
    const current = min.get(target);
    if (!current || compare(version, current) < 0) min.set(target, version);
  }
  return [...min].map(([name, version]) => `${name}${version.join(".")}`).sort();
}

/** esbuild({ options: { target } }) に渡す */
export const jsTargets = toEsbuildTargets(resolved);
