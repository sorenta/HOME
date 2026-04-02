import type { Metadata, Viewport } from "next";
import {
  Barlow_Condensed,
  Fraunces,
  Inter,
  Laila,
  Lora,
  Manrope,
  Nunito,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeBottomNav } from "@/components/navigation/theme-bottom-nav";
import { GlobalCornerActions } from "@/components/layout/global-corner-actions";
import { THEMES, DEFAULT_THEME } from "@/lib/theme-logic";
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

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "WONK", "opsz"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "H:0",
  description:
    "H:0 household flow for kitchen, finance, calendar, pharmacy, and RESET.",
  applicationName: "H:0",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "H:0",
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
    { media: "(prefers-color-scheme: light)", color: "#F4F0F6" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lv"
      className="h-full"
      data-home-layout={THEMES[DEFAULT_THEME].homeScreenLayout}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${manrope.variable} ${laila.variable} ${lora.variable} ${playfair.variable} ${barlowCondensed.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${nunito.variable} min-h-full bg-[color:var(--color-background)] font-[family-name:var(--font-theme-sans)] text-[color:var(--color-text)] antialiased`}
      >
        <AppProviders>
          <div className="relative isolate mx-auto flex min-h-full max-w-lg flex-col">
            <GlobalCornerActions />
            <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col">
              {children}
            </div>
            <ThemeBottomNav />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
