import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tabela, yerel lead masası",
  description:
    "İl ve ilçe seçince web sitesi olmayan işletmeleri öne çıkaran örnek arayüz.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
