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
