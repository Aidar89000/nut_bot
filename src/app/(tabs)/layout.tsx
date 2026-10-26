import type { ReactNode } from "react";
import { BottomNav } from "@/modules/shell/bottom-nav";

// Навигация в layout не перемонтируется между вкладками — индикатор плавно едет.
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
