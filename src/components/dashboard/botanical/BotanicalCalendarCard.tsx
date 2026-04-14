"use client";

import { useI18n } from "@/lib/i18n/i18n-context";

export function BotanicalCalendarCard() {
  const { t } = useI18n();

  return (
    <div 
      className="relative flex flex-col justify-center items-start overflow-hidden p-6 sm:p-8"
      style={{
        background: "color-mix(in srgb, var(--color-surface) 60%, transparent)",
        boxShadow: "inset 0 6px 16px rgba(62,107,50,0.1), inset 0 -2px 6px rgba(255,255,255,0.4)",
        borderRadius: "60% 40% 65% 35% / 40% 50% 50% 60%", // Pebble/Stone shape
        border: "1px solid rgba(160,140,118,0.1)",
        minHeight: "180px",
      }}
    >
      {/* Mossy/leafy texture + subtle veins */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(62,107,50,0.09) 0 2px, transparent 2px 12px),
            repeating-linear-gradient(-45deg, rgba(160,140,118,0.07) 0 1.5px, transparent 1.5px 10px),
            radial-gradient(ellipse at 70% 30%, rgba(62,107,50,0.08) 0%, transparent 70%),
            radial-gradient(ellipse at 20% 80%, rgba(160,140,118,0.06) 0%, transparent 80%)
          `,
          borderRadius: "60% 40% 65% 35% / 40% 50% 50% 60%",
        }}
      />
      
      <div className="relative z-10 w-full pl-4 border-l-4 border-(--color-primary)">
        <p className="text-xs font-bold uppercase tracking-widest text-(--color-primary) opacity-80 mb-2">
          {t("tile.calendar")}
        </p>
        <div className="space-y-1">
          <p className="text-xl font-bold leading-tight text-(--color-text-primary)">
            Pusdienas ar ģimeni
          </p>
          <p className="text-sm font-medium text-(--color-text-secondary)">
            Šodien, 18:00
          </p>
        </div>
      </div>
      
      <div className="relative z-10 mt-6 pl-4">
        <p className="text-xs text-(--color-text-muted) italic">
          Vēl 2 sīki uzdevumi gaida.
        </p>
      </div>
    </div>
  );
}