export interface ImgProps {
  src: string;
}

export default function ({ src }: ImgProps) {
  return (
    <img
      src={src}
      transform-images="avif webp"
    />
  );
}
