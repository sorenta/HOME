import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Barlow_Condensed,
  Fraunces,
  Inter,
  Laila,
  Lora,
  Manrope,
  Nunito,
  Playfair_Display,
  Rajdhani,
  Space_Grotesk,
} from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeBottomNav } from "@/components/navigation/theme-bottom-nav";
import { GlobalCornerActions } from "@/components/layout/global-corner-actions";
import { THEMES, DEFAULT_THEME, buildRootThemeCssVars } from "@/lib/theme-logic";
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

/** FORGE UI: technical, legible, slightly condensed — industrial dashboard tone (not display). */
const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "H:O",
  description:
    "H:O household flow for kitchen, finance, calendar, pharmacy, and RESET.",
  applicationName: "H:O",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "H:O",
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

const defaultThemeManifest = THEMES[DEFAULT_THEME];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootStyle: CSSProperties = {
    ...buildRootThemeCssVars(defaultThemeManifest),
    colorScheme:
      defaultThemeManifest.id === "forge" || defaultThemeManifest.id === "botanical"
        ? "dark"
        : "light",
  };

  return (
    <html
      lang="lv"
      className="h-full"
      data-theme={defaultThemeManifest.id}
      data-layout-density={defaultThemeManifest.layoutDensity}
      data-theme-motion={defaultThemeManifest.motion}
      data-home-layout={defaultThemeManifest.homeScreenLayout}
      style={rootStyle}
      suppressHydrationWarning
    >
      <body
        className={`
          ${inter.variable} ${manrope.variable} ${laila.variable} 
          ${lora.variable} ${playfair.variable} ${barlowCondensed.variable} 
          ${fraunces.variable} ${spaceGrotesk.variable} ${nunito.variable} 
          ${rajdhani.variable} 
          min-h-full antialiased bg-[color:var(--color-background)] text-[color:var(--color-text)] font-[family-name:var(--font-theme-sans)]
        `.trim()}
      >
        <AppProviders>
          <div className="relative isolate mx-auto flex min-h-full max-w-lg flex-col">
            <GlobalCornerActions />
            <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col">
              {children}
            </div>
            <ThemeSwitcher />
          </div>
          <ThemeBottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
