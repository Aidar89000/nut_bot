"use client";

import { cn } from "cn";
import { useState } from "react";

// Фото из Telegram поверх первой буквы имени: пока фото грузится
// или если не загрузилось, видна буква.
export function Avatar({ src, name, className }: { src: string | null; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initial = (name.trim()[0] ?? "B").toUpperCase();

  return (
    <span
      className={cn(
        "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-line-strong bg-accent-soft font-medium text-accent text-[17px]",
        className
      )}
    >
      <span aria-hidden>{initial}</span>
      {src && !failed && (
        // Внешнее фото Telegram (часто SVG) — оптимизация next/image тут не нужна.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailed(true)}
          src={src}
        />
      )}
    </span>
  );
}
