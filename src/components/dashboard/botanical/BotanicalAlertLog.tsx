"use client";

import { useI18n } from "@/lib/i18n/i18n-context";

export function BotanicalAlertLog() {
  const { locale } = useI18n();

  return (
    <div 
      className="relative flex flex-col p-6 transition-all"
      style={{
        borderRadius: "30% 70% 50% 50% / 50% 50% 70% 30%", // Morphing organic leaf shape, mirror of CargoManifest
        background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,242,235,0.4) 100%)",
        boxShadow: "inset 0 4px 10px rgba(62,107,50,0.08)",
        border: "1px solid rgba(160,140,118,0.2)",
      }}
    >
      <div className="relative z-10 flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-primary) opacity-90">
          {locale === "lv" ? "Uzmanību" : "Alerts"}
        </p>
      </div>
      
      <div className="space-y-4 z-10 h-full flex flex-col justify-center">
        <div className="flex gap-4 items-start border-l-2 border-rose-400 pl-3">
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Šodien, 10:00</p>
            <p className="mt-0.5 text-sm font-semibold text-(--color-text-primary)">
              Zāļu piegāde aizkavēsies
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 items-start border-l-2 border-amber-500 pl-3">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Rīt, 12:00</p>
            <p className="mt-0.5 text-sm font-semibold text-(--color-text-primary)">
              Paziņojums par īri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
