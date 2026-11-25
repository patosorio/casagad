import type { ReactNode } from "react";
import { Photo } from "@/components/site/Photo";
import type { PhotoModel } from "@/lib/content/photos";

export function Card({
  photo,
  alt,
  eyebrow,
  title,
  facts,
  children,
}: {
  photo: PhotoModel;
  alt: string;
  eyebrow: string;
  title: string;
  facts?: string;
  children: ReactNode;
}) {
  return (
    <article className="border border-linea bg-bianco">
      <Photo photo={photo} alt={alt} sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />
      <div className="px-[22px] pt-5 pb-6">
        <p className="mb-2.5 font-body text-eyebrow font-medium tracking-eyebrow text-pietra uppercase">
          {eyebrow}
        </p>
        <h3>{title}</h3>
        {facts ? <p className="mb-3.5 text-small text-pietra">{facts}</p> : null}
        {children}
      </div>
    </article>
  );
}
