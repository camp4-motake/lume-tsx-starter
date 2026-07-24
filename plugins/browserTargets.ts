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
import { defaults as lightningCssDefaults } from "lume/plugins/lightningcss.ts";

const BROWSERS = "> 0.5% in JP and last 2 years and not dead";

// lightningcss-wasm 1.32 の browserslistToTargets は and_chr → chrome などの
// 名前マッピングを定義しながら適用しないため、解決リスト側を先に正規化する。
// 重複したブラウザ名の最小バージョン採用は browserslistToTargets が行う
const CANIUSE_ALIASES: Record<string, string> = {
  and_chr: "chrome",
  and_ff: "firefox",
  ie_mob: "ie",
  op_mob: "opera",
};

const resolved = browserslist(BROWSERS).map((entry) => {
  const [name, version] = entry.split(" ");
  return `${CANIUSE_ALIASES[name] ?? name} ${version}`;
});

const targets = browserslistToTargets(resolved) as Record<string, number>;

// Lume の merge() はキー単位の深マージで、渡さないキーには内蔵デフォルト
// (古いバージョン)が残ってしまう。デフォルトが持つキーのうちクエリ結果に
// 無いものは同系エンジンの値で埋めて、古いターゲットへの巻き戻りを防ぐ
const ENGINE_FALLBACKS: Record<string, string> = {
  android: "chrome",
  edge: "chrome",
  opera: "chrome",
  samsung: "chrome",
  ios_saf: "safari",
  safari: "ios_saf",
};
for (const key of Object.keys(lightningCssDefaults.options?.targets ?? {})) {
  const fallback = ENGINE_FALLBACKS[key];
  if (targets[key] == null && fallback != null && targets[fallback] != null) {
    targets[key] = targets[fallback];
  }
}

export const cssTargets: Targets = targets;

// caniuse 名 → esbuild ターゲット名。載っていないもの(samsung など)は
// esbuild が受け付けないためスキップする
const ESBUILD_NAMES: Record<string, string> = {
  chrome: "chrome",
  edge: "edge",
  firefox: "firefox",
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

export const jsTargets = toEsbuildTargets(resolved);
