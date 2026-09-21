"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductImageGallery({
  urls,
  alt,
}: {
  urls: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const images = urls.length > 0 ? urls : [];
  const current = images[Math.min(active, Math.max(images.length - 1, 0))];

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-background text-sm font-normal text-foreground sm:aspect-[4/3] lg:aspect-square">
        —
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-background sm:aspect-[4/3] lg:aspect-square">
        <Image
          key={current}
          src={current}
          alt={alt}
          fill
          priority={true}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => {
            const selected = index === active;
            return (
              <li key={`${url}-${index}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`${alt} ${index + 1}`}
                  aria-pressed={selected}
                  className={`relative size-16 overflow-hidden rounded-md border transition sm:size-20 ${
                    selected
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
