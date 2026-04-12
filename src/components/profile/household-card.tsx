"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { useTheme } from "@/components/providers/theme-provider";
import type { HouseholdMember, Household } from "@/lib/household";
import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/lib/i18n/i18n-context";

type HouseholdCardProps = {
  household: Household | null;
  roleLabel: string;
  members: HouseholdMember[];
};

function memberBadgeName(member: HouseholdMember): string {
  return member.display_name?.trim() || "Member";
}

function initialsFromName(name: string): string {
  const chunks = name.split(" ").map((c) => c.trim()).filter(Boolean);
  if (chunks.length === 0) return "M";
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
  return `${chunks[0][0] ?? ""}${chunks[1][0] ?? ""}`.toUpperCase();
}

export function HouseholdCard({ household, roleLabel, members }: HouseholdCardProps) {
  const { themeId } = useTheme();
  const { t } = useI18n();
  const [showQr, setShowQr] = useState(false);
  
  const isForge = themeId === "forge";

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined" || !household?.qr_code) return "";
    return `${window.location.origin}/auth?code=${household.qr_code}`;
  }, [household?.qr_code]);

  const householdName = household?.name || "";

  // Avatar shape per theme
  const avatarStyle: React.CSSProperties =
    themeId === "hive"
      ? { clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)" }
      : themeId === "botanical"
        ? { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }
        : themeId === "pulse"
          ? { borderRadius: "4px", border: "2px solid #000" }
          : themeId === "forge"
            ? { borderRadius: "1px", borderLeft: "2px solid var(--color-primary)" }
            : { borderRadius: "9999px" }; // lucent — circle

  if (isForge) {
    return (
      <GlassPanel className="p-0 overflow-hidden font-mono">
        <div className="border-b border-white/5 bg-white/5 px-4 py-3 flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Vienības_Sastāvs</h2>
          <button 
            onClick={() => setShowQr(!showQr)}
            className="text-xs font-black text-primary border border-primary/30 px-2 py-0.5 rounded-sm hover:bg-primary/10 transition-all"
          >
            [ {showQr ? "AIZVĒRT_QR" : "UZAICINĀT_BIEDRU"} ]
          </button>
        </div>
        <div className="p-5 space-y-4">
          {showQr && inviteUrl ? (
            <div className="flex flex-col items-center gap-4 py-4 bg-white/5 border border-white/5 rounded-sm">
              <div className="p-2 bg-white rounded-sm shadow-[0_0_20px_rgba(225,29,46,0.3)]">
                <QRCodeSVG value={inviteUrl} size={140} level="H" />
              </div>
              <p className="text-xs text-center text-white/40 uppercase tracking-widest max-w-[200px]">
                Skenējiet šo kodu ar citu ierīci, lai pievienotos vienībai
              </p>
            </div>
          ) : (
            <>
              <div className="border-l-2 border-primary pl-4 py-1">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">MĀJSAIMNIECĪBA</p>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  {householdName || "SISTĒMAS_TELPA"}
                </h3>
                <p className="text-xs text-white/40 uppercase mt-1">LOMA: {roleLabel}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {members.slice(0, 8).map((member) => {
                  const name = memberBadgeName(member);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 border border-white/5 bg-black/20 px-3 py-2 rounded-sm"
                    >
                      <span
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-black/40 text-xs font-bold text-primary border border-primary/20"
                        style={avatarStyle}
                      >
                        {initialsFromName(name)}
                      </span>
                      <span className="truncate text-xs font-black text-white/80 uppercase tracking-tight">{name}</span>
                      <span className="ml-auto text-xs text-primary/40 animate-pulse">●</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </GlassPanel>
    );
  }

  // Member row card style per theme
  const rowStyle: React.CSSProperties =
    themeId === "pulse"
      ? { border: "2px solid #000", boxShadow: "2px 2px 0px #000", borderRadius: "var(--radius-card)" }
      : themeId === "hive"
        ? { borderWidth: "2px", borderRadius: "var(--radius-card)" }
        : {};

  return (
    <GlassPanel className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-secondary)">
            Mans household
          </p>
          <h3 className="mt-1 text-lg font-bold text-(--color-text-primary)">
            {householdName || "Personal space"}
          </h3>
          <p className="mt-1 text-sm text-(--color-text-secondary)">{roleLabel}</p>
        </div>
        <button 
          onClick={() => setShowQr(!showQr)}
          className="rounded-full border border-(--color-border) px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-(--color-text-secondary) hover:border-(--color-primary) hover:text-(--color-primary) transition-all"
        >
          {showQr ? t("nav.back") : t("household.qr.title")}
        </button>
      </div>

      {showQr && inviteUrl ? (
        <div className="flex flex-col items-center gap-4 py-6 bg-(--color-surface-2) rounded-[2rem] border border-(--color-border)">
          <div className="p-4 bg-white rounded-3xl shadow-xl">
            <QRCodeSVG value={inviteUrl} size={160} level="H" />
          </div>
          <p className="text-xs text-center text-(--color-text-secondary) px-8 leading-relaxed">
            {t("household.qr.hint")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {members.slice(0, 6).map((member) => {
            const name = memberBadgeName(member);
            return (
              <div
                key={member.id}
                className="flex items-center gap-2 border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_85%,transparent)] px-2.5 py-2"
                style={{
                  borderRadius: "var(--radius-card)",
                  ...rowStyle,
                }}
              >
                <span
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-(--color-surface-2) text-xs font-bold text-(--color-text-primary)"
                  style={avatarStyle}
                >
                  {initialsFromName(name)}
                </span>
                <span className="truncate text-xs font-medium text-(--color-text-primary)">{name}</span>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
