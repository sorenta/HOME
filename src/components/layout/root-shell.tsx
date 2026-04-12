"use client";

import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { GlobalCornerActions } from "@/components/layout/global-corner-actions";
import { ThemeBottomNav } from "@/components/navigation/theme-bottom-nav";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSandboxRoute = pathname.startsWith("/sandbox");

  if (isSandboxRoute) {
    return <div className="relative min-h-[100dvh] w-full">{children}</div>;
  }

  return (
    <>
      <div className="relative isolate mx-auto flex min-h-full max-w-lg flex-col">
        <GlobalCornerActions />
        <main id="main-content" className="relative z-10 flex min-h-[100dvh] flex-1 flex-col">
          {children}
        </main>
        <ThemeSwitcher />
      </div>
      <ThemeBottomNav />
    </>
  );
}
