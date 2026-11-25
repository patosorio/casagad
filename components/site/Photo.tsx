import { getImageProps } from "next/image";
import type { PhotoModel } from "@/lib/content/photos";

export function Photo({
  photo,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  photo: PhotoModel;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const { props } = getImageProps({
    src: photo.src,
    alt,
    width: photo.width,
    height: photo.height,
    sizes,
    unoptimized: true,
    priority,
  });

  return (
    <picture>
      <source type="image/avif" srcSet={photo.avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={photo.webpSrcSet} sizes={sizes} />
      {/* Manifest srcset: the image optimizer stays off. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={alt} className={`text-transparent ${className}`} srcSet={photo.webpSrcSet} style={undefined} />
    </picture>
  );
}
