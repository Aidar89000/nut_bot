import { cn } from "cn";
import type { ReactNode } from "react";
import { LogoMark } from "@/ui/logo";

// Колонка экрана с отступами под вырез и нижнюю навигацию.
export function Screen({
  children,
  withNav = false,
  className,
}: {
  children: ReactNode;
  withNav?: boolean;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "px-5 pt-[calc(22px+var(--safe-top))] max-[360px]:px-4",
        withNav ? "pb-[calc(124px+var(--safe-bottom))]" : "pb-[calc(32px+var(--safe-bottom))]",
        className
      )}
    >
      {children}
    </main>
  );
}

export function Splash() {
  return (
    <div aria-busy className="grid min-h-(--app-height) place-items-center" role="status">
      <LogoMark className="size-14 animate-breathe" />
      <span className="sr-only">Загрузка</span>
    </div>
  );
}

export function NoticeScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-(--app-height) flex-col items-center justify-center gap-5 px-8 text-center">
      <LogoMark className="size-14" />
      <h1 className="font-medium text-[28px] leading-tight tracking-[-0.04em]">{title}</h1>
      <div className="max-w-[300px] text-muted text-[13px] leading-relaxed">{children}</div>
    </main>
  );
}
