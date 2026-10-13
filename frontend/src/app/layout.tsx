import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Engine — ShopDeck",
  description:
    "Strategic creative brief and prompt generation engine for Meta ad campaigns. Turn any product into approved, ready-to-use creative prompts in under 5 minutes.",
  keywords: ["creative engine", "meta ads", "creative briefs", "shopdeck", "d2c"],
  authors: [{ name: "ShopDeck Growth Team" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
