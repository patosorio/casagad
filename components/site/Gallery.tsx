"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type SyntheticEvent } from "react";
import { Container } from "@/components/site/Container";
import { Photo } from "@/components/site/Photo";
import { Section } from "@/components/site/Section";
import type { PhotoModel } from "@/lib/content/photos";

export type GalleryGroup = {
  id: string;
  title: string;
  photos: readonly { photo: PhotoModel; alt: string }[];
};

type OpenState = { group: number; index: number };

export function Gallery({
  groups,
  labels,
}: {
  groups: readonly GalleryGroup[];
  labels: { close: string; previous: string; next: string; dialog: string };
}) {
  const [open, setOpen] = useState<OpenState | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      closeRef.current?.focus();
      return;
    }
    if (dialog.open) dialog.close();
    openerRef.current?.focus();
  }, [open]);

  const current = open ? groups[open.group]?.photos[open.index] : undefined;

  function move(delta: number) {
    if (!open) return;
    const photos = groups[open.group]?.photos;
    if (!photos || photos.length === 0) return;
    const next = (open.index + delta + photos.length) % photos.length;
    setOpen({ group: open.group, index: next });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  }

  function onCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    setOpen(null);
  }

  function onBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) setOpen(null);
  }

  return (
    <div>
      {groups.map((group, groupIndex) => (
        <Section key={group.id} titleId={`${group.id}-title`}>
          <h2 id={`${group.id}-title`}>{group.title}</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            {group.photos.map((item, index) => (
              <button
                key={item.photo.id}
                type="button"
                className="cursor-zoom-in border-0 bg-transparent p-0"
                aria-label={item.alt}
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setOpen({ group: groupIndex, index });
                }}
              >
                <Photo
                  photo={item.photo}
                  alt={item.alt}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="aspect-[3/2] w-full object-cover"
                />
              </button>
            ))}
          </div>
        </Section>
      ))}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="w-full border-0 bg-transparent p-0 backdrop:bg-inchiostro/80"
        onKeyDown={onKeyDown}
        onCancel={onCancel}
        onClick={onBackdrop}
      >
        {current ? (
          <Container>
          <div className="bg-bianco">
            <div className="flex items-center justify-between gap-3 py-2">
              <p id={titleId} className="m-0 text-small">
                {labels.dialog}
              </p>
              <button
                ref={closeRef}
                type="button"
                className="inline-flex min-h-tap min-w-tap items-center justify-center border border-linea bg-bianco text-inchiostro"
                onClick={() => setOpen(null)}
              >
                {labels.close}
              </button>
            </div>
            <Photo photo={current.photo} alt={current.alt} sizes="100vw" className="max-h-[70vh] w-full object-contain" />
            <p className="m-0 py-3 text-small text-pietra">{current.alt}</p>
            <div className="flex gap-2 pb-4">
              <button
                type="button"
                className="inline-flex min-h-tap items-center border border-linea bg-bianco px-4 text-inchiostro"
                onClick={() => move(-1)}
              >
                {labels.previous}
              </button>
              <button
                type="button"
                className="inline-flex min-h-tap items-center border border-linea bg-bianco px-4 text-inchiostro"
                onClick={() => move(1)}
              >
                {labels.next}
              </button>
            </div>
          </div>
          </Container>
        ) : null}
      </dialog>
    </div>
  );
}
