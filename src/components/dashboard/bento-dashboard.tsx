"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { AppMark } from "@/components/branding/app-mark";
import { GlassPanel } from "@/components/ui/glass-panel";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { fetchMyHouseholdMembers, type HouseholdMember } from "@/lib/household";
import {
  buildHouseholdActivityFeed,
  fetchHouseholdActivityFeed,
  subscribeHouseholdActivity,
  type ActivityFeedRow,
} from "@/lib/household-activity";
import { fetchKitchenInventory, fetchShoppingItems, type KitchenInventoryRecord, type ShoppingRecord } from "@/lib/kitchen";
import { fetchOpenHouseholdTaskCount } from "@/lib/events-sync";
import { hasResetCheckInToday } from "@/lib/reset-checkin";

export { ThemeBottomNav as AppBottomNav } from "@/components/navigation/theme-bottom-nav";

type TriageItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
};

function memberName(member: HouseholdMember | null | undefined, fallback: string): string {
  if (!member) return fallback;
  const name = member.display_name?.trim();
  return name && name.length > 0 ? name : fallback;
}

export function BentoDashboard() {
  const { t, locale } = useI18n();
  const { profile, user } = useAuth();

  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [activityRows, setActivityRows] = useState<ActivityFeedRow[]>([]);
  const [shopping, setShopping] = useState<ShoppingRecord[]>([]);
  const [inventory, setInventory] = useState<KitchenInventoryRecord[]>([]);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [resetDoneToday] = useState(() => hasResetCheckInToday());

  const householdId = profile?.household_id ?? null;
  const displayName =
    profile?.display_name ??
    (user?.user_metadata.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    t("app.name");

  useEffect(() => {
    if (!householdId) return;
    let alive = true;

    void Promise.all([
      fetchMyHouseholdMembers(),
      fetchHouseholdActivityFeed(householdId),
      fetchShoppingItems(householdId),
      fetchKitchenInventory(householdId),
      fetchOpenHouseholdTaskCount(householdId),
    ]).then(([nextMembers, nextActivity, nextShopping, nextInventory, nextPending]) => {
      if (!alive) return;
      setMembers(nextMembers);
      setActivityRows(nextActivity);
      setShopping(nextShopping);
      setInventory(nextInventory);
      setPendingTasks(nextPending);
    });

    const unsubscribe = subscribeHouseholdActivity(householdId, () => {
      void fetchHouseholdActivityFeed(householdId).then((rows) => {
        if (alive) setActivityRows(rows);
      });
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [householdId]);

  const partner =
    !user?.id
      ? members[0] ?? null
      : members.find((member) => member.id !== user.id) ?? members[0] ?? null;

  const triageItems = useMemo<TriageItem[]>(() => {
    const items: TriageItem[] = [];

    if (!resetDoneToday) {
      items.push({
        id: "reset",
        title: locale === "lv" ? "RESET check-in nav izdarits" : "RESET check-in is pending",
        detail: locale === "lv" ? "Pabeidz sodienas check-in, lai noturetu ritmu." : "Complete today's check-in to keep your rhythm.",
        href: "/reset",
      });
    }

    if (pendingTasks > 0) {
      items.push({
        id: "tasks",
        title:
          locale === "lv"
            ? `Neaizverti uzdevumi: ${pendingTasks}`
            : `Open tasks: ${pendingTasks}`,
        detail: locale === "lv" ? "Termini tuvojas nakamajas 3 dienas." : "Deadlines are near in the next 3 days.",
        href: "/events",
      });
    }

    const openShopping = shopping.filter((item) => item.status === "open").length;
    if (openShopping > 0) {
      items.push({
        id: "shopping",
        title:
          locale === "lv"
            ? `Pirkumu saraksta ieraksti: ${openShopping}`
            : `Shopping list items: ${openShopping}`,
        detail: locale === "lv" ? "Apskati grozu un atzime paveikto." : "Review your cart and mark done.",
        href: "/kitchen",
      });
    }

    const urgentInventory = inventory.filter((item) => item.status === "expiring" || item.status === "low_stock").length;
    if (urgentInventory > 0) {
      items.push({
        id: "inventory",
        title:
          locale === "lv"
            ? `Steidzami produkti: ${urgentInventory}`
            : `Urgent inventory items: ${urgentInventory}`,
        detail: locale === "lv" ? "Deriguma termins vai atlikums prasa uzmanibu." : "Expiry date or low stock needs attention.",
        href: "/kitchen",
      });
    }

    return items.slice(0, 3);
  }, [inventory, locale, pendingTasks, resetDoneToday, shopping]);

  const feedLines = useMemo(
    () =>
      householdId
        ? buildHouseholdActivityFeed(
            activityRows,
            members,
            locale,
            t("household.membersList.member"),
          ).slice(0, 3)
        : [],
    [activityRows, householdId, locale, members, t],
  );

  const openShoppingPreview = shopping.filter((item) => item.status === "open").slice(0, 5);

  const challengeTitle = resetDoneToday
    ? locale === "lv"
      ? "Sodienas izaicinajums izpildits"
      : "Today's challenge completed"
    : locale === "lv"
      ? "Sodienas izaicinajums: 10 min klusais bridis"
      : "Today's challenge: 10 minutes of quiet time";

  const challengeBody = resetDoneToday
    ? locale === "lv"
      ? "Lieliski! Vari pievienot vel vienu mazu uzvaru RESET sadaļā."
      : "Great. You can add one more small win in RESET."
    : locale === "lv"
      ? "Atver RESET un piefikse savas sajutas, lai noslegtu dienu ar skaidru fokusu."
      : "Open RESET and log your state to close the day with clear focus.";

  if (!householdId) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-4 p-4">
        <HiddenSeasonalCollectible spotId="home" />
        <GlassPanel className="space-y-2">
          <AppMark size="sm" />
          <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {locale === "lv" ? `Sveiks, ${displayName}` : `Hi, ${displayName}`}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {locale === "lv"
              ? "Lai redzetu personalizeto sakuma skatu, vispirms piesaisti majsaimniecibu."
              : "Connect a household first to unlock the personalized home view."}
          </p>
        </GlassPanel>
        <HouseholdOnboarding compact />
      </div>
    );
  }

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-4 px-4 py-5">
      <HiddenSeasonalCollectible spotId="home" />

      <GlassPanel className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <AppMark size="sm" />
            <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {locale === "lv" ? `Sveiks, ${displayName}` : `Hello, ${displayName}`}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {locale === "lv"
                ? "Tavs majas vadibas centrs sodienai."
                : "Your household command center for today."}
            </p>
          </div>
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              borderColor: "var(--color-surface-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-secondary)",
            }}
          >
            {locale === "lv" ? "SVEICIENS" : "HERO"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/reset"
            className="rounded-full border px-4 py-2 text-sm font-semibold"
            style={{
              borderColor: "var(--color-accent)",
              background: "var(--color-surface-2)",
              color: "var(--color-text-primary)",
            }}
          >
            {locale === "lv" ? "Atvert RESET" : "Open RESET"}
          </Link>
          <Link
            href="/events"
            className="rounded-full border px-4 py-2 text-sm"
            style={{
              borderColor: "var(--color-surface-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-secondary)",
            }}
          >
            {locale === "lv" ? "Kalendars" : "Calendar"}
          </Link>
          <Link
            href="/kitchen"
            className="rounded-full border px-4 py-2 text-sm"
            style={{
              borderColor: "var(--color-surface-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-secondary)",
            }}
          >
            {locale === "lv" ? "Virtuve" : "Kitchen"}
          </Link>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-text-secondary)" }}>
          {locale === "lv" ? "Sodien svarigakais" : "Today's triage"}
        </p>
        {triageItems.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {locale === "lv" ? "Nakamajas 3 dienas nav kritisku punktu." : "No urgent points in the next 3 days."}
          </p>
        ) : (
          <div className="space-y-2">
            {triageItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-[var(--radius-card)] border p-3"
                style={{ borderColor: "var(--color-surface-border)", background: "var(--color-surface)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{item.title}</p>
                <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>{item.detail}</p>
              </Link>
            ))}
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-text-secondary)" }}>
          {locale === "lv" ? "Biedra noskanojums" : "Partner mood"}
        </p>
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-[var(--radius-card)] border p-3"
          style={{ borderColor: "var(--color-surface-border)", background: "var(--color-surface)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {locale === "lv"
              ? `${memberName(partner, "Biedrs")} var but vajadzigs mazs atbalsts.`
              : `${memberName(partner, "Partner")} may need a gentle check-in.`}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {locale === "lv"
              ? "Gentle nudge: pajauta, ka pagaja diena, un piedava 10 min mieru." 
              : "Gentle nudge: ask how their day went and offer 10 minutes of calm."}
          </p>
        </motion.div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-text-secondary)" }}>
          {locale === "lv" ? "Izaicinajums" : "Challenge"}
        </p>
        <div className="rounded-[var(--radius-card)] border p-3" style={{ borderColor: "var(--color-surface-border)", background: "var(--color-surface)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{challengeTitle}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>{challengeBody}</p>
          <Link
            href="/reset"
            className="mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-text-primary)", background: "var(--color-surface-2)" }}
          >
            {locale === "lv" ? "Skatīt RESET" : "Open RESET"}
          </Link>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-text-secondary)" }}>
            {locale === "lv" ? "Iepirkumu grozs" : "Shopping cart"}
          </p>
          <Link href="/kitchen" className="text-xs" style={{ color: "var(--color-accent)" }}>
            {locale === "lv" ? "Atvert" : "Open"}
          </Link>
        </div>
        {openShoppingPreview.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {locale === "lv" ? "Grozs ir tukss." : "Cart is empty."}
          </p>
        ) : (
          <ul className="space-y-2">
            {openShoppingPreview.map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--radius-card)] border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-surface-border)", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
              >
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>

      <GlassPanel
        className="space-y-3"
        style={{
          opacity: 0.82,
          background: "color-mix(in srgb, var(--color-card) 70%, transparent)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-text-secondary)" }}>
          {locale === "lv" ? "Papildu parskati" : "Additional overviews"}
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[var(--radius-card)] border p-2" style={{ borderColor: "var(--color-surface-border)", background: "var(--color-surface)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{locale === "lv" ? "Biedri" : "Members"}</p>
            <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>{members.length}</p>
          </div>
          <div className="rounded-[var(--radius-card)] border p-2" style={{ borderColor: "var(--color-surface-border)", background: "var(--color-surface)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{locale === "lv" ? "Aktivitate" : "Feed"}</p>
            <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>{feedLines.length}</p>
          </div>
          <div className="rounded-[var(--radius-card)] border p-2" style={{ borderColor: "var(--color-surface-border)", background: "var(--color-surface)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{locale === "lv" ? "Uzdevumi" : "Tasks"}</p>
            <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>{pendingTasks}</p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
