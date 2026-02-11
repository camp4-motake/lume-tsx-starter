/**
 * Auto Image Component
 *
 * @see https://lume.land/plugins/image_size/
 * @see https://lume.land/plugins/picture/
 * @see https://lume.land/plugins/transform_images/
 */

interface Props {
  sources?: {
    srcset: string;
    media?: string;
  }[];
}

export default function Image(
  { sources = [], ...props }: Props & Lume.Data,
  { useAttrs }: Lume.Helpers,
) {
  const attributes = {
    "image-size": "",
    "transform-images": props["transform-images"] || "avif png",
    loading: props.loading || "lazy",
    ...useAttrs(props, "img"),
  };

  if (sources.length > 0) {
    return (
      <picture>
        {sources.map((source) =>
          source?.srcset && (
            <source key={source.srcset} transform-images="avif png" {...{ ...source }} />
          )
        )}
        <img {...{ ...attributes }} />
      </picture>
    );
  }

  return <img {...{ ...attributes }} />;
}
