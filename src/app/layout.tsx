import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import {
  Fraunces,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import { RootShell } from "@/components/layout/root-shell";
import { AppProviders } from "@/components/providers/app-providers";
import { THEMES, DEFAULT_THEME, buildRootThemeCssVars } from "@/lib/theme-logic";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
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

export const metadata: Metadata = {
  metadataBase: new URL("https://ho.majas.app"),
  title: {
    default: "H:O | Mājsaimniecības operētājsistēma",
    template: "%s | H:O",
  },
  description:
    "H:O ir tavs haosa organizators – vieda mājsaimniecības pārvaldība: virtuve, finanses, kalendārs un labsajūta vienuviet.",
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
  openGraph: {
    type: "website",
    siteName: "H:O HomeOS",
    title: "H:O | Mājsaimniecības operētājsistēma",
    description: "Vieda mājsaimniecības pārvaldība miera pilnai ikdienai.",
    locale: "lv_LV",
  },
  twitter: {
    card: "summary_large_image",
    title: "H:O | Mājsaimniecības operētājsistēma",
    description: "Vieda mājsaimniecības pārvaldība miera pilnai ikdienai.",
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
      <head>
        <JsonLd />
      </head>
      <body
        className={`
          ${inter.variable} ${fraunces.variable} ${spaceGrotesk.variable} 
          min-h-full antialiased bg-background text-(--color-text) font-(family-name:--font-theme-sans)
        `.trim()}
      >
        <AppProviders>
          <RootShell>{children}</RootShell>
        </AppProviders>
      </body>
    </html>
  );
}
