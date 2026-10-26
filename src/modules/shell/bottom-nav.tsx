"use client";

import { cn } from "cn";
import { ActivityIcon, HouseIcon, LayoutGridIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isOnboarded } from "@/modules/onboarding/progress";
import { useOptionalAppState } from "@/modules/session/store";
import { haptic } from "@/modules/telegram/sdk";
import { rememberTab } from "./last-tab";
import { NAV_TAB } from "./transitions";

const TABS = [
  { href: "/home", label: "Главная", icon: HouseIcon },
  { href: "/rhythm", label: "Биоритмы", icon: ActivityIcon },
  { href: "/library", label: "Материалы", icon: LayoutGridIcon },
  { href: "/profile", label: "Профиль", icon: UserIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  // В layout навигация рендерится и на сервере — показываем её, когда данные загружены.
  const visible = useOptionalAppState(isOnboarded, false);
  const active = TABS.findIndex((tab) => tab.href === pathname);

  useEffect(() => {
    if (active >= 0) rememberTab(TABS[active].href);
  }, [active]);

  if (!visible) return null;

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed bottom-[calc(12px+var(--safe-bottom))] left-1/2 z-20 flex w-[min(448px,calc(100%-24px))] -translate-x-1/2 animate-nav-in rounded-[26px] border border-line bg-glass p-[7px] shadow-[0_12px_40px_rgb(13_35_25/0.14)] backdrop-blur-[22px] [view-transition-name:bottom-nav]"
    >
      {/* Подложка активной вкладки переезжает, а не мигает. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-[7px] left-[7px] w-[calc((100%-14px)/4)] rounded-[19px] bg-accent-soft transition-[translate,opacity] duration-400 ease-soft",
          active < 0 && "opacity-0"
        )}
        style={{ translate: `${Math.max(active, 0) * 100}% 0` }}
      />
      {TABS.map(({ href, label, icon: Icon }, i) => {
        const current = i === active;
        return (
          <Link
            aria-current={current ? "page" : undefined}
            className={cn(
              "relative flex min-h-[61px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[19px] px-0.5 py-2 font-medium text-xs transition-[color,scale] duration-200 active:scale-95 max-[360px]:text-[11px]",
              current ? "text-accent" : "text-muted hover:text-ink"
            )}
            href={href}
            key={href}
            onClick={() => {
              if (!current) haptic.selection();
            }}
            replace
            transitionTypes={NAV_TAB}
          >
            <Icon
              className={cn("size-[22px] transition-transform duration-300 ease-soft", current && "-translate-y-0.5")}
              strokeWidth={current ? 2 : 1.65}
            />
            <span className="max-w-full truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
