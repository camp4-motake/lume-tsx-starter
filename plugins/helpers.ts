import bcd from "@mdn/browser-compat-data" with { type: "json" };

/**
 * HTML attribute sets
 */
const HTML_ATTRIBUTES = new Set([
  ...Object.keys(bcd.html.global_attributes),
  ...Object.values(bcd.html.elements).flatMap((el) => Object.keys(el || {})),
]);

/**
 * Return only HTML attributes, excluding Lume-specific properties.
 *
 * @example <a {...useAttrs(props)}>
 * @example <a {...useAttrs(props, ["variant", "size"])}>
 */
export const useAttrs = (
  props: Lume.Data,
  omitKeys: string[] = [],
) => {
  const attrs: Record<string, unknown> = {};
  const omitSet = new Set([...omitKeys]);

  for (const key in props) {
    if (omitSet.has(key)) continue;

    if (
      HTML_ATTRIBUTES.has(key) ||
      key.startsWith("data-") ||
      key.startsWith("aria-")
    ) {
      attrs[key] = props[key];
    }
  }
  return attrs;
};

/**
 * Range array
 *
 * @param start
 * @param end
 * @returns range array
 */
export const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * Path join
 *
 * @param paths
 * @returns joined path
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
 * Uppercase string
 *
 * @param body
 * @returns uppercase string
 */
export const uppercase = (body: string) => body.toUpperCase();
