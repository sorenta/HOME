import { getBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { HouseholdMember } from "@/lib/household";

export type ActivityFeedRow = {
  id: string;
  actor_id: string | null;
  module: string;
  action: string;
  target: string | null;
  created_at: string;
};

export type HouseholdActivityItem = {
  id: string;
  line: string;
  time: string;
  source: "db" | "demo";
};

const FALLBACK_DEMO_NAMES_LV = ["Leo", "Vārtiņš", "Lāsma"] as const;

/** Curated Latvian lines; paired with names by index when using demo fill. */
const DEMO_VERBS_LV = [
  "izmazgāja zobus",
  "nopirka visu, kas bija grozā",
  "samaksāja rēķinu",
  "atzīmēja RESET check-in",
  "pievienoja kalendāram jaunu notikumu",
  "papildināja virtuvi ar jaunām precēm",
] as const;

export function formatActivityRelative(
  iso: string,
  locale: Locale,
): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60_000));

  if (locale === "lv") {
    if (minutes < 1) return "tikko";
    if (minutes < 60) return `pirms ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "pirms 1 h" : `pirms ${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "pirms 1 d" : `pirms ${days} d`;
  }

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1h ago" : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1d ago" : `${days}d ago`;
}

export async function fetchHouseholdActivityFeed(
  householdId: string,
  limit = 16,
): Promise<ActivityFeedRow[]> {
  const supabase = getBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("activity_feed")
    .select("id, actor_id, module, action, target, created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch activity_feed", error);
    return [];
  }

  return (data as ActivityFeedRow[] | null) ?? [];
}

function actorLabel(
  actorId: string | null,
  members: HouseholdMember[],
  unknown: string,
): string {
  if (!actorId) return unknown;
  const hit = members.find((m) => m.id === actorId);
  return hit?.display_name ?? unknown;
}

function lineFromRow(
  row: ActivityFeedRow,
  members: HouseholdMember[],
  unknown: string,
): string {
  const name = actorLabel(row.actor_id, members, unknown);
  const tail = [row.action, row.target].filter(Boolean).join(" ").trim();
  return tail ? `${name} ${tail}` : name;
}

/**
 * If `activity_feed` has rows, show those only. Otherwise show curated demo lines
 * using household member names (or Leo / Vārtiņš / Lāsma as fallback).
 */
export function buildHouseholdActivityFeed(
  rows: ActivityFeedRow[],
  members: HouseholdMember[],
  locale: Locale,
  unknownMember: string,
  demoCount = 6,
): HouseholdActivityItem[] {
  const fromDb: HouseholdActivityItem[] = rows.map((row) => ({
    id: `db-${row.id}`,
    line: lineFromRow(row, members, unknownMember),
    time: formatActivityRelative(row.created_at, locale),
    source: "db",
  }));

  if (fromDb.length > 0) {
    return fromDb.slice(0, 12);
  }

  const names: string[] =
    members.length > 0
      ? members.map((m) => m.display_name ?? unknownMember)
      : [...FALLBACK_DEMO_NAMES_LV];

  const demo: HouseholdActivityItem[] = [];
  for (let i = 0; i < demoCount; i += 1) {
    const name = names[i % names.length] ?? unknownMember;
    const verb = DEMO_VERBS_LV[i % DEMO_VERBS_LV.length];
    const created = new Date(Date.now() - (5 + i * 19) * 60_000).toISOString();
    demo.push({
      id: `demo-${i}-${verb}`,
      line: `${name} ${verb}`,
      time: formatActivityRelative(created, locale),
      source: "demo",
    });
  }

  return demo;
}

export function subscribeHouseholdActivity(
  householdId: string,
  onChange: () => void,
): (() => void) | undefined {
  const supabase = getBrowserClient();
  if (!supabase) return undefined;

  const channel = supabase
    .channel(`activity-feed:${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activity_feed",
        filter: `household_id=eq.${householdId}`,
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
