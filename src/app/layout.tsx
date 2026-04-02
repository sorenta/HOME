import type { Metadata, Viewport } from "next";
import {
  Inter,
  Laila,
  Lora,
  Manrope,
  Playfair_Display,
} from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { AppBottomNav } from "@/components/dashboard/bento-dashboard";
import { GlobalCornerActions } from "@/components/layout/global-corner-actions";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const laila = Laila({
  variable: "--font-laila",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "HOME:OS",
  description:
    "HOME:OS household flow for kitchen, finance, calendar, pharmacy, and RESET.",
  applicationName: "HOME:OS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HOME:OS",
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#2b3101" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${laila.variable} ${lora.variable} ${playfair.variable} min-h-full bg-[color:var(--color-background)] font-[family-name:var(--font-theme-sans)] text-[color:var(--color-text)] antialiased`}
      >
        <AppProviders>
          <div className="relative isolate mx-auto flex min-h-full max-w-lg flex-col">
            <GlobalCornerActions />
            <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col">
              {children}
            </div>
            <AppBottomNav />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
