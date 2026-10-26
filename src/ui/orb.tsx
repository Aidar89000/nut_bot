import { cn } from "cn";

// Декор карточек: концентрические кольца и «сфера». Цвета берутся из tone-*.
export function Orb({ rings, core, className }: { rings?: string; core?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]", className)}
    >
      <span
        className={cn(
          "orb-rings absolute -top-12 -right-41 size-73 rounded-full border border-white/10 transition-transform duration-700 ease-soft group-hover:-translate-x-1.5",
          rings
        )}
      />
      <span
        className={cn(
          "orb-core absolute top-11 -right-5.5 size-39 rounded-full transition-transform duration-700 ease-soft group-hover:-translate-1 group-hover:scale-[1.025]",
          core
        )}
      />
    </span>
  );
}
