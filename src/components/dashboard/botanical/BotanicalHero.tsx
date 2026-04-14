"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

export function BotanicalHero() {
  const { profile, user } = useAuth();
  const { t, locale } = useI18n();

  const name = profile?.display_name || user?.email?.split("@")[0] || "";
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 transition-all">
      {/* 
        BOTANICAL VARIANT B: "Izgriezts no Koka" (Relief / Carved into the background)
        Instead of a floating card, this looks like a deep, organic carving into a natural surface.
      */}

      {/* Deep wood grain + moss texture */}
      <div 
        className="absolute inset-0 z-0 bg-(--color-surface-2)"
        style={{
          borderRadius: "45% 55% 40% 60% / 55% 45% 60% 40%",
          boxShadow: "inset 0 10px 30px rgba(62,107,50,0.15), inset 0 -4px 10px rgba(255,255,255,0.6)",
          border: "2px solid rgba(160,140,118,0.1)",
          backgroundImage: `
            repeating-linear-gradient(120deg, rgba(62,107,50,0.07) 0 2px, transparent 2px 12px),
            repeating-linear-gradient(60deg, rgba(160,140,118,0.08) 0 1.5px, transparent 1.5px 10px),
            radial-gradient(ellipse at 60% 40%, rgba(62,107,50,0.09) 0%, transparent 70%),
            radial-gradient(ellipse at 30% 70%, rgba(160,140,118,0.07) 0%, transparent 80%)
          `,
        }}
      />
      {/* Topographic / Wood ring pattern overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at center, transparent 30%, rgba(62,107,50,0.18) 100%),
            repeating-radial-gradient(circle at 0 0, transparent 0, transparent 10px, rgba(62,107,50,0.09) 10px, rgba(62,107,50,0.09) 11px)
          `,
          borderRadius: "45% 55% 40% 60% / 55% 45% 60% 40%",
        }}
      />

      <div className="relative z-10 flex items-center gap-5">
        <div 
          className="flex h-16 w-16 shrink-0 items-center justify-center text-2xl font-black text-white"
          style={{
            borderRadius: "30% 70% 50% 50% / 50% 50% 70% 30%", // Morphing organic leaf shape
            background: "linear-gradient(135deg, var(--color-primary) 0%, rgba(62,107,50,0.8) 100%)",
            boxShadow: "0 8px 20px rgba(62,107,50,0.2), inset 0 2px 4px rgba(255,255,255,0.3)",
          }}
        >
          {firstLetter}
        </div>
        
        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-(--color-primary) opacity-80">
            {locale === "lv" ? "Dienas sākums" : "Morning Dew"}
          </p>
          <h2 className="mt-0.5 text-2xl font-black tracking-tight text-(--color-text-primary)" style={{ fontFamily: "var(--font-theme-display)" }}>
            Sveiks, {name}!
          </h2>
          <p className="mt-1 text-sm font-medium text-(--color-text-secondary)">
            Tavs dārzs šodien zied. Viss ir savās vietās.
          </p>
        </div>
      </div>
    </div>
  );
}