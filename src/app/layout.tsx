import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preconnect, preload } from "react-dom";
import { TelegramProvider } from "@/modules/telegram/provider";
import { TELEGRAM_SCRIPT_URL } from "@/modules/telegram/sdk";
import { THEME_BOOT_SCRIPT } from "@/modules/telegram/theme";
import { ToastProvider } from "@/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "greeful",
  description: "Персональный календарь, материалы и дневник настроения.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1813" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Скрипт Telegram скачивается параллельно с JS приложения, а не после гидрации.
  preconnect("https://telegram.org");
  preload(TELEGRAM_SCRIPT_URL, { as: "script" });

  return (
    <html data-theme="light" lang="ru" suppressHydrationWarning>
      <head>
        {/* Тема до первой отрисовки — без вспышки светлого фона. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <ToastProvider>
          <TelegramProvider>
            <div className="mx-auto min-h-(--app-height) w-full max-w-[480px] min-[481px]:shadow-[0_0_90px_rgb(13_35_25/0.08)]">
              {children}
            </div>
          </TelegramProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
