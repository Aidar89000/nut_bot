import { cn } from "cn";
import type { ReactNode } from "react";
import type { MoodId } from "@/modules/session/state";

const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round" } as const;

const FACES: Record<MoodId, ReactNode> = {
  1: (
    <>
      <ellipse cx="35" cy="43" rx="3.2" ry="4.1" />
      <ellipse cx="65" cy="43" rx="3.2" ry="4.1" />
      <path d="M36 67q14-16 28 0" strokeWidth="4" {...line} />
      <path d="m28 33 10 2m24 0 10-2" strokeWidth="2.6" {...line} />
    </>
  ),
  2: (
    <>
      <path d="M28 42q7 5 14 0m16 0q7 5 14 0" strokeWidth="3.5" {...line} />
      <ellipse cx="50" cy="65" rx="6.5" ry="7.5" />
    </>
  ),
  3: (
    <>
      <ellipse cx="35" cy="42" rx="3.4" ry="4.2" />
      <ellipse cx="65" cy="42" rx="3.4" ry="4.2" />
      <path d="M39 64h22" strokeWidth="4" {...line} />
    </>
  ),
  4: <path d="M27 42q7 7 14 0m18 0q7 7 14 0M38 61q12 11 24 0" strokeWidth="3.8" {...line} />,
  5: (
    <>
      <path d="M29 42q2-11 10-5m22 0q8-6 10 5" strokeWidth="4.5" {...line} />
      <path d="M32 57q18 8 36 0c-2 22-32 24-36 0Z" />
    </>
  ),
};

// Объёмная «сфера» с лицом — вместо эмодзи, одинаково на всех платформах.
export function MoodSphere({ id, className }: { id: MoodId; className?: string }) {
  return (
    <span className={cn("mood-sphere", className)}>
      <svg aria-hidden className="relative block size-full" fill="currentColor" viewBox="0 0 100 100">
        {FACES[id]}
      </svg>
    </span>
  );
}
