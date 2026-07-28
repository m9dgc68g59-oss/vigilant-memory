import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoupaJá — Poupa nas compras, sem esforço",
  description:
    "Fotografa o teu talão de supermercado e descobre quanto poderias ter poupado. Suportamos Continente, Pingo Doce e mais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
