import type { Metadata, Viewport } from "next";
import { Inter, Laila, Mingzat } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { AppBottomNav } from "@/components/dashboard/bento-dashboard";
import "./globals.css";

const mingzat = Mingzat({
  variable: "--font-mingzat",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const laila = Laila({
  variable: "--font-laila",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Mājas · HomeOS",
  description:
    "Mājsaimniecības lietotne: virtuve, finanses, RESET, aptieciņa un notikumi.",
  applicationName: "Mājas",
  manifest: "/manifest.json",
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
        className={`${mingzat.variable} ${inter.variable} ${laila.variable} min-h-full bg-[color:var(--color-background)] font-[family-name:var(--font-theme-sans)] text-[color:var(--color-text)] antialiased`}
      >
        <AppProviders>
          <div className="mx-auto flex min-h-full max-w-lg flex-col">
            {children}
            <AppBottomNav />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
