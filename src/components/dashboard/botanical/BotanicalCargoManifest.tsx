"use client";

import { useI18n } from "@/lib/i18n/i18n-context";

export function BotanicalCargoManifest() {
  const { t, locale } = useI18n();

  return (
    <div 
      className="relative flex flex-col p-6 transition-all"
      style={{
        borderRadius: "50% 50% 30% 70% / 70% 30% 70% 30%", // Morphing organic leaf shape
        background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,242,235,0.4) 100%)",
        boxShadow: "inset 0 4px 10px rgba(62,107,50,0.08)",
        border: "1px solid rgba(160,140,118,0.2)",
      }}
    >
      <div className="relative z-10 flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-primary) opacity-90">
          {locale === "lv" ? "Grozs" : "Basket"}
        </p>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-primary)/20 text-xs font-black text-(--color-primary)">
          3
        </span>
      </div>
      
      <div className="space-y-3 z-10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-orange-400" />
          <p className="text-sm font-semibold text-(--color-text-primary)">Burkāni</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
          <p className="text-sm font-semibold text-(--color-text-primary)">Salātu lapas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <p className="text-sm font-semibold text-(--color-text-primary)">Medus</p>
        </div>
      </div>
    </div>
  );
}
