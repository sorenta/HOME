"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import type { HouseholdMember } from "@/lib/household";
import {
  getMlForMember,
  todayIso,
  yesterdayIso,
  type HouseholdWaterV1,
} from "@/lib/household-water-local";
import {
  addWaterSynced,
  loadWaterStateSynced,
  subscribeHouseholdWater,
} from "@/lib/household-water-sync";

type Props = {
  /** Household id or `personal:${userId}` */
  scopeId: string;
  members: HouseholdMember[];
  currentUserId: string | null;
};

function memberLabel(m: HouseholdMember, t: (k: string) => string): string {
  return m.display_name?.trim() || t("household.membersList.member");
}

function progressTone(pct: number): "good" | "warn" | "neutral" {
  if (pct >= 100) return "good";
  if (pct >= 50) return "neutral";
  return "warn";
}

export function HouseholdWaterWidget({ scopeId, members, currentUserId }: Props) {
  const { t } = useI18n();
  const [water, setWater] = useState<HouseholdWaterV1 | null>(null);
  const householdId = scopeId.startsWith("personal:") ? null : scopeId;

  const effectiveMembers = useMemo(() => {
    if (members.length > 0) return members;
    if (currentUserId) {
      return [
        {
          id: currentUserId,
          display_name: null,
          role_label: null,
          is_me: true,
        } satisfies HouseholdMember,
      ];
    }
    return [];
  }, [members, currentUserId]);

  const memberIds = useMemo(() => effectiveMembers.map((m) => m.id), [effectiveMembers]);

  useEffect(() => {
    let alive = true;
    const frame = requestAnimationFrame(() => {
      void loadWaterStateSynced({
        scopeId,
        householdId,
        currentUserId,
      }).then((next) => {
        if (alive) {
          setWater(next);
        }
      });
    });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [currentUserId, householdId, memberIds, scopeId]);

  useEffect(() => {
    const unsubscribe = subscribeHouseholdWater(householdId, () => {
      void loadWaterStateSynced({
        scopeId,
        householdId,
        currentUserId,
      }).then(setWater);
    });

    return () => {
      unsubscribe?.();
    };
  }, [currentUserId, householdId, scopeId]);

  const date = todayIso();
  const yest = yesterdayIso();

  const yesterdayRows = useMemo(() => {
    if (!water) return [];
    return effectiveMembers
      .map((m) => ({ m, ml: getMlForMember(water, yest, m.id) }))
      .sort((a, b) => b.ml - a.ml);
  }, [water, effectiveMembers, yest]);

  const addForMember = useCallback((memberId: string, ml: number) => {
    if (!water) return;
    hapticTap();
    void addWaterSynced({
      scopeId,
      householdId,
      currentUserId,
      memberId,
      date,
      deltaMl: ml,
      currentState: water,
    }).then(setWater);
  }, [currentUserId, date, householdId, scopeId, water]);

  if (!water || effectiveMembers.length === 0) {
    return null;
  }

  const goal = water.goalMl;

  return (
    <section className="relative z-10 mb-4 rounded-3xl border border-[color:var(--color-surface-border)] bg-[linear-gradient(180deg,var(--color-surface),transparent)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <SectionHeading
          eyebrow={t("water.widget.eyebrow")}
          title={t("water.widget.title")}
          detail={t("water.widget.localNote")}
        />
      </div>
      <p className="mt-2 text-sm text-[color:var(--color-secondary)]">{t("water.widget.hint")}</p>

      <ul className="mt-4 space-y-3">
        {effectiveMembers.map((m) => {
          const ml = getMlForMember(water, date, m.id);
          const pct = Math.min(100, Math.round((ml / goal) * 100));
          const ach = water.achievements[m.id] ?? { gold: 0, silver: 0, bronze: 0 };
          const isMe = m.is_me || m.id === currentUserId;
          return (
            <li
              key={m.id}
              className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/40 px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[color:var(--color-text)]">
                    {memberLabel(m, t)}
                  </p>
                  <p className="text-xs text-[color:var(--color-secondary)]">
                    {ml} / {goal} ml · {t("water.widget.medalsSummary", {
                      g: String(ach.gold),
                      s: String(ach.silver),
                      b: String(ach.bronze),
                    })}
                  </p>
                </div>
                {isMe ? (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => addForMember(m.id, 250)}
                      className="rounded-full border border-[color:var(--color-surface-border)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text)]"
                    >
                      +250 ml
                    </button>
                    <button
                      type="button"
                      onClick={() => addForMember(m.id, 500)}
                      className="rounded-full border border-[color:var(--color-surface-border)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text)]"
                    >
                      +500 ml
                    </button>
                  </div>
                ) : null}
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-border)]"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${pct}%`,
                    background: "color-mix(in srgb, var(--color-primary) 85%, transparent)",
                  }}
                />
              </div>
              <div className="mt-1.5">
                <StatusPill tone={progressTone(pct)}>
                  {pct >= 100 ? t("water.widget.goalMet") : t("water.widget.goalOpen", { pct: String(pct) })}
                </StatusPill>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 border-t border-[color:var(--color-surface-border)] pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-secondary)]">
          {t("water.widget.yesterdayTitle")}
        </p>
        {yesterdayRows.every((r) => r.ml === 0) ? (
          <p className="mt-2 text-sm text-[color:var(--color-secondary)]">
            {t("water.widget.yesterdayEmpty")}
          </p>
        ) : (
          <ol className="mt-2 space-y-2">
            {yesterdayRows.map((row, idx) => {
              const medal = idx === 0 && row.ml > 0 ? "🥇" : idx === 1 && row.ml > 0 ? "🥈" : idx === 2 && row.ml > 0 ? "🥉" : "·";
              return (
                <li
                  key={row.m.id}
                  className="flex items-center justify-between gap-2 text-sm text-[color:var(--color-text)]"
                >
                  <span>
                    <span className="mr-2" aria-hidden>
                      {medal}
                    </span>
                    {memberLabel(row.m, t)}
                  </span>
                  <span className="text-[color:var(--color-secondary)]">{row.ml} ml</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
