"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import type { HouseholdMember } from "@/lib/household";
import {
  addWater,
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
  const [syncHint, setSyncHint] = useState<"load" | "settle" | "addFailed" | "partial" | null>(null);
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
      }).then((res) => {
        if (alive) {
          setWater(res.state);
          if (res.loadFailed) {
            setSyncHint("load");
          } else if (res.settleFailed) {
            setSyncHint("settle");
          } else {
            setSyncHint(null);
          }
        }
      });
    });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [currentUserId, householdId, memberIds, scopeId]);

  useEffect(() => {
    let alive = true;
    const unsubscribe = subscribeHouseholdWater(householdId, () => {
      void loadWaterStateSynced({
        scopeId,
        householdId,
        currentUserId,
      }).then((res) => {
        if (!alive) return;
        setWater(res.state);
        if (res.loadFailed) setSyncHint("load");
        else if (res.settleFailed) setSyncHint("settle");
        else setSyncHint(null);
      });
    });

    return () => {
      alive = false;
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
    const before = water;
    setWater(addWater(before, date, memberId, ml));
    void addWaterSynced({
      scopeId,
      householdId,
      currentUserId,
      memberId,
      date,
      deltaMl: ml,
      currentState: before,
    }).then((res) => {
      setWater(res.state);
      if (res.sync === "failed") {
        setSyncHint("addFailed");
      } else if (res.sync === "partial") {
        setSyncHint("partial");
      } else {
        setSyncHint(null);
      }
    });
  }, [currentUserId, date, householdId, scopeId, water]);

  if (!water || effectiveMembers.length === 0) {
    return null;
  }

  const goal = water.goalMl;

  return (
    <section className="maj-panel-lite maj-section-gap relative z-10 px-3 py-3 sm:px-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-(--color-text-secondary)">
            {t("water.widget.eyebrow")}
          </p>
          <h2 className="maj-theme-section-title mt-0.5">{t("water.widget.title")}</h2>
        </div>
        <span className="text-[0.68rem] font-medium text-(--color-text-secondary)">
          {t("water.widget.localNote")}
        </span>
      </div>
      <p className="maj-theme-subtitle mt-1 text-xs text-(--color-text-secondary)">
        {t("water.widget.hint")}
      </p>
      {syncHint ? (
        <p
          className="mt-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
          role="status"
        >
          {syncHint === "load"
            ? t("water.widget.syncLoadFailed")
            : syncHint === "settle"
              ? t("water.widget.syncSettleFailed")
              : syncHint === "addFailed"
                ? t("water.widget.syncAddFailed")
                : t("water.widget.syncPartial")}
        </p>
      ) : null}

      <ul className="mt-3 divide-y divide-[color-mix(in_srgb,var(--color-border)_65%,transparent)]">
        {effectiveMembers.map((m) => {
          const ml = getMlForMember(water, date, m.id);
          const pct = Math.min(100, Math.round((ml / goal) * 100));
          const ach = water.achievements[m.id] ?? { gold: 0, silver: 0, bronze: 0 };
          const isMe = m.is_me || m.id === currentUserId;
          return (
            <li key={m.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-(family-name:--font-theme-display) font-semibold text-(--color-text-primary)">
                    {memberLabel(m, t)}
                  </p>
                  <p className="text-xs text-(--color-secondary)">
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
                      className="rounded-full border border-(--color-surface-border) px-2.5 py-1 text-xs font-semibold text-(--color-text)"
                    >
                      +250 ml
                    </button>
                    <button
                      type="button"
                      onClick={() => addForMember(m.id, 500)}
                      className="rounded-full border border-(--color-surface-border) px-2.5 py-1 text-xs font-semibold text-(--color-text)"
                    >
                      +500 ml
                    </button>
                  </div>
                ) : null}
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-(--color-surface-border)"
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

      <div className="mt-3 border-t border-[color-mix(in_srgb,var(--color-border)_65%,transparent)] pt-3">
        <p className="maj-metric-label">{t("water.widget.yesterdayTitle")}</p>
        {yesterdayRows.every((r) => r.ml === 0) ? (
          <p className="mt-1.5 text-xs text-(--color-secondary)">
            {t("water.widget.yesterdayEmpty")}
          </p>
        ) : (
          <ol className="mt-2 space-y-1.5">
            {yesterdayRows.map((row, idx) => {
              const medal = idx === 0 && row.ml > 0 ? "🥇" : idx === 1 && row.ml > 0 ? "🥈" : idx === 2 && row.ml > 0 ? "🥉" : "·";
              return (
                <li
                  key={row.m.id}
                  className="flex items-center justify-between gap-2 text-sm text-(--color-text)"
                >
                  <span>
                    <span className="mr-2" aria-hidden>
                      {medal}
                    </span>
                    {memberLabel(row.m, t)}
                  </span>
                  <span className="text-(--color-secondary)">{row.ml} ml</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
