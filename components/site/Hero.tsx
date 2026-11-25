import { getImageProps } from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/site/Container";
import type { PhotoModel } from "@/lib/content/photos";

function ArtPhoto({
  mobile,
  desktop,
  alt,
  priority,
  className,
}: {
  mobile: PhotoModel;
  desktop: PhotoModel;
  alt: string;
  priority: boolean;
  className: string;
}) {
  const { props } = getImageProps({
    src: mobile.src,
    alt,
    width: mobile.width,
    height: mobile.height,
    sizes: "(min-width: 1024px) 42vw, 100vw",
    unoptimized: true,
    priority,
  });

  return (
    <picture>
      <source media="(min-width: 768px)" type="image/avif" srcSet={desktop.avifSrcSet} sizes="(min-width: 1024px) 42vw, 100vw" />
      <source media="(min-width: 768px)" type="image/webp" srcSet={desktop.webpSrcSet} sizes="(min-width: 1024px) 42vw, 100vw" />
      <source type="image/avif" srcSet={mobile.avifSrcSet} sizes="100vw" />
      <source type="image/webp" srcSet={mobile.webpSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={alt} className={`text-transparent ${className}`} style={undefined} />
    </picture>
  );
}

export function Hero({
  eyebrow,
  title,
  lead,
  mobile,
  desktop,
  alt,
  actions,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  mobile: PhotoModel;
  desktop: PhotoModel;
  alt: string;
  actions: ReactNode;
}) {
  return (
    <section aria-labelledby="h1">
      <ArtPhoto
        mobile={mobile}
        desktop={desktop}
        alt={alt}
        priority
        className="aspect-[4/5] w-full object-cover md:aspect-video lg:hidden"
      />
      <Container className="py-8 lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14 lg:py-16">
        <div>
          <p className="mb-3.5 font-body text-eyebrow font-medium tracking-eyebrow text-pietra uppercase">
            {eyebrow}
          </p>
          <h1 id="h1" className="text-hero">
            {title}
          </h1>
          <p className="mb-0 font-body text-lead font-light">{lead}</p>
          <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
        </div>
        <ArtPhoto
          mobile={desktop}
          desktop={desktop}
          alt={alt}
          priority={false}
          className="hidden aspect-video w-full object-cover lg:block"
        />
      </Container>
    </section>
  );
}
