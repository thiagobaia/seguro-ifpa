import type { Metadata } from "next";
import { UiStoreProvider } from "@/components/ui-store-provider";
import { SiteHeader } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iris — Comunicação Digital e SST",
  description: "Comunicação Digital e Segurança do Trabalho.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <UiStoreProvider><SiteHeader />{children}</UiStoreProvider>
      </body>
    </html>
  );
}
