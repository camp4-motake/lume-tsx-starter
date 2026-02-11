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
  const defaultSrcSet = "avif png";
  const attributes = {
    "image-size": "",
    "transform-images": props["transform-images"] || defaultSrcSet,
    loading: props.loading || "lazy",
    ...useAttrs(props, "img"),
  };

  if (sources.length > 0) {
    return (
      <picture>
        {sources.map((source) =>
          source?.srcset && (
            <source
              transform-images={defaultSrcSet}
              {...{ ...source }}
            />
          )
        )}
        <img {...{ ...attributes }} />
      </picture>
    );
  }

  return <img {...{ ...attributes }} />;
}
