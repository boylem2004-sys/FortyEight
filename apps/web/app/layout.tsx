import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FortyEight: plan your weekend", template: "%s | FortyEight" },
  description:
    "Tell FortyEight where you are, what your group likes, and what you want to spend. Get a short list of things to do this weekend.",
  applicationName: "FortyEight",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#161722" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-5xl px-gutter pt-6 pb-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
