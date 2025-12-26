import { omit } from "es-toolkit";

/**
 * range array
 */
export const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * path join
 */
export function pathJoin(...paths: string[]) {
  const firstPath = paths[0] || "";
  const protocolMatch = firstPath.match(/^(https?:\/\/)/i);
  const protocol = protocolMatch ? protocolMatch[1] : "";

  const pathsWithoutProtocol = paths.map((path, index) => {
    if (index === 0 && protocol) {
      return path.replace(protocol, "");
    }
    return path;
  });

  const result = pathsWithoutProtocol
    .map((path, index) => {
      if (index === paths.length - 1) {
        return path;
      }
      return path?.replace(/\/+$/, "");
    })
    .join("/")
    .replace(/\/{2,}/g, "/");

  return protocol + result;
}

/**
 * Return only HTML attributes, excluding Lume-specific properties.
 *
 * @example <a {...useAttrs(props)}>
 * @example <a {...useAttrs(props, ["variant", "size"])}>
 */
export const useAttrs = (
  props: Lume.Data,
  omitKeys: string[] = [],
) => omit(props, [...LUME_DATA_KEYS, ...omitKeys]);

const LUME_DATA_KEYS = [
  // JSX
  "children",

  // RawData
  "tags",
  "url",
  "basename",
  "draft",
  "date",
  "renderOrder",
  "content",
  "layout",
  "templateEngine",
  "mergedKeys",

  // Data
  "comp",
  "page",
  "unmatchedLangUrl",
  "alternates",
  "paginate",
  "search",
  "config",
] as const;
