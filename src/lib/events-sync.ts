"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import {
  readPlannerEvents,
  readPlannerTasks,
  writePlannerEvents,
  writePlannerTasks,
  type PlannerEvent,
  type PlannerTask,
  type EventKind,
} from "@/lib/events-planner";

type CalendarEventRow = {
  id: string;
  title: string;
  starts_on: string;
  visibility: "household" | "individual";
  event_time?: string | null;
  notes?: string | null;
  event_type?: string | null;
};

type HouseholdTaskRow = {
  id: string;
  title: string;
  assignee_user_id: string | null;
  due_on: string;
  is_done: boolean;
};

export type PlannerSyncResult =
  | { ok: true }
  | { ok: false; message: string };

function syncErr(message: string): PlannerSyncResult {
  return { ok: false, message };
}

function syncOk(): PlannerSyncResult {
  return { ok: true };
}

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  return "Sync failed";
}

function isMissingRelation(error: unknown) {
  const message =
    typeof error === "object" && error
      ? `${(error as { message?: string }).message ?? ""}`.toLowerCase()
      : "";
  return message.includes("does not exist") || message.includes("could not find");
}

const CALENDAR_EVENT_SELECT = "id, title, starts_on, visibility, event_type" as const;

async function loadCalendarEventRows(
  supabase: SupabaseClient,
  input: { householdId: string | null; userId: string | null },
): Promise<{ rows: CalendarEventRow[]; error: unknown }> {
  if (!input.householdId) {
    if (!input.userId) {
      return { rows: [], error: null };
    }
    const { data, error } = await supabase
      .from("calendar_events")
      .select(CALENDAR_EVENT_SELECT)
      .eq("visibility", "individual")
      .eq("user_id", input.userId)
      .order("starts_on", { ascending: true });
    return { rows: (data as CalendarEventRow[] | null) ?? [], error };
  }

  if (!input.userId) {
    const { data, error } = await supabase
      .from("calendar_events")
      .select(CALENDAR_EVENT_SELECT)
      .eq("visibility", "household")
      .eq("household_id", input.householdId)
      .order("starts_on", { ascending: true });
    return { rows: (data as CalendarEventRow[] | null) ?? [], error };
  }

  const [householdRes, personalRes] = await Promise.all([
    supabase
      .from("calendar_events")
      .select(CALENDAR_EVENT_SELECT)
      .eq("visibility", "household")
      .eq("household_id", input.householdId)
      .order("starts_on", { ascending: true }),
    supabase
      .from("calendar_events")
      .select(CALENDAR_EVENT_SELECT)
      .eq("visibility", "individual")
      .eq("user_id", input.userId)
      .order("starts_on", { ascending: true }),
  ]);

  const error = householdRes.error ?? personalRes.error;
  if (error) {
    return { rows: [], error };
  }

  const householdRows = (householdRes.data as CalendarEventRow[] | null) ?? [];
  const personalRows = (personalRes.data as CalendarEventRow[] | null) ?? [];
  const rows = [...householdRows, ...personalRows].sort((a, b) =>
    a.starts_on.localeCompare(b.starts_on),
  );

  return { rows, error: null };
}

export async function loadPlannerStateSynced(input: {
  householdId: string | null;
  userId: string | null;
  memberNameById: Record<string, string>;
  fallbackMemberName: string;
}) {
  const localEvents = readPlannerEvents();
  const localTasks = readPlannerTasks();

  const supabase = getBrowserClient();
  if (!supabase) {
    return { events: localEvents, tasks: localTasks };
  }

  const taskQuery = input.householdId
    ? supabase
        .from("household_tasks")
        .select("id, title, assignee_user_id, due_on, is_done")
        .eq("household_id", input.householdId)
        .order("due_on", { ascending: true })
    : Promise.resolve({ data: [] as HouseholdTaskRow[], error: null });

  const [eventsPart, tasksRes] = await Promise.all([
    loadCalendarEventRows(supabase, input),
    taskQuery,
  ]);
  const error = eventsPart.error ?? tasksRes.error;

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to load synced planner state", error);
    }
    return { events: localEvents, tasks: localTasks };
  }

  const remoteEvents: PlannerEvent[] = eventsPart.rows.map(
    (row) => {
      const type = row.event_type || "event";
      const isRecurring = type.endsWith(":annual");
      const kind = (isRecurring ? type.split(":")[0] : type) as EventKind;

      return {
        id: row.id,
        title: row.title,
        date: row.starts_on,
        style: row.visibility === "household" ? "shared" : "personal",
        kind: kind || "event",
        isRecurring,
      };
    },
  );

  const remoteTasks: PlannerTask[] = ((tasksRes.data as HouseholdTaskRow[] | null) ?? []).map(
    (row) => ({
      id: row.id,
      title: row.title,
      assigneeId: row.assignee_user_id ?? "",
      assigneeName:
        (row.assignee_user_id && input.memberNameById[row.assignee_user_id]) ||
        input.fallbackMemberName,
      dueDate: row.due_on,
      done: row.is_done,
    }),
  );

  writePlannerEvents(remoteEvents);
  writePlannerTasks(remoteTasks);
  return { events: remoteEvents, tasks: remoteTasks };
}

export async function addPlannerEventSynced(input: {
  householdId: string | null;
  userId: string | null;
  title: string;
  date: string;
  style: "shared" | "personal";
  kind?: EventKind;
  isRecurring?: boolean;
  event_time?: string;
  notes?: string;
}): Promise<PlannerSyncResult> {
  const supabase = getBrowserClient();
  if (!supabase) return syncErr("SUPABASE_MISSING");

  const visibility = input.style === "shared" ? "household" : "individual";
  if (visibility === "household" && !input.householdId) {
    return syncErr("HOUSEHOLD_REQUIRED");
  }
  if (visibility === "individual" && !input.userId) {
    return syncErr("USER_REQUIRED");
  }

  const finalType = input.isRecurring ? `${input.kind || "event"}:annual` : (input.kind || "event");

  const { error } = await supabase.from("calendar_events").insert({
    household_id: visibility === "household" ? input.householdId : null,
    user_id: visibility === "individual" ? input.userId : null,
    title: input.title.trim(),
    event_type: finalType,
    starts_on: input.date,
    visibility,
    event_time: input.event_time,
    notes: input.notes,
  });

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to add planner event", error);
    }
    return syncErr(
      isMissingRelation(error) ? "SCHEMA_CALENDAR_EVENTS" : errorMessage(error),
    );
  }

  return syncOk();
}

export async function updatePlannerEventSynced(input: {
  eventId: string;
  householdId: string | null;
  userId: string | null;
  title: string;
  date: string;
  style: "shared" | "personal";
  kind?: EventKind;
  isRecurring?: boolean;
  event_time?: string;
  notes?: string;
}): Promise<PlannerSyncResult> {
  const supabase = getBrowserClient();
  if (!supabase) return syncErr("SUPABASE_MISSING");

  const visibility = input.style === "shared" ? "household" : "individual";
  const finalType = input.isRecurring ? `${input.kind || "event"}:annual` : (input.kind || "event");

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: input.title.trim(),
      event_type: finalType,
      starts_on: input.date,
      visibility,
      event_time: input.event_time,
      notes: input.notes,
    })
    .eq("id", input.eventId);

  if (error) {
    console.error("Failed to update planner event", error);
    return syncErr(errorMessage(error));
  }

  return syncOk();
}

export async function addPlannerTaskSynced(input: {
  householdId: string | null;
  userId: string | null;
  title: string;
  assigneeId: string;
  dueDate: string;
}): Promise<PlannerSyncResult> {
  if (!input.householdId) {
    return syncErr("HOUSEHOLD_REQUIRED");
  }
  const supabase = getBrowserClient();
  if (!supabase) return syncErr("SUPABASE_MISSING");

  const { error } = await supabase.from("household_tasks").insert({
    household_id: input.householdId,
    created_by: input.userId ?? null,
    assignee_user_id: input.assigneeId || null,
    title: input.title.trim(),
    due_on: input.dueDate,
    is_done: false,
  });

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to add planner task", error);
    }
    return syncErr(
      isMissingRelation(error) ? "SCHEMA_HOUSEHOLD_TASKS" : errorMessage(error),
    );
  }

  return syncOk();
}

export async function togglePlannerTaskSynced(input: {
  householdId: string | null;
  taskId: string;
  done: boolean;
}): Promise<PlannerSyncResult> {
  if (!input.householdId) return syncErr("HOUSEHOLD_REQUIRED");
  const supabase = getBrowserClient();
  if (!supabase) return syncErr("SUPABASE_MISSING");

  const { error } = await supabase
    .from("household_tasks")
    .update({ is_done: input.done, updated_at: new Date().toISOString() })
    .eq("household_id", input.householdId)
    .eq("id", input.taskId);

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to toggle planner task", error);
    }
    return syncErr(isMissingRelation(error) ? "SCHEMA_HOUSEHOLD_TASKS" : errorMessage(error));
  }

  return syncOk();
}

export async function deletePlannerEventSynced(input: {
  eventId: string;
  style: "shared" | "personal";
  householdId: string | null;
  userId: string | null;
}): Promise<PlannerSyncResult> {
  const supabase = getBrowserClient();
  if (!supabase) return syncErr("SUPABASE_MISSING");

  let query = supabase.from("calendar_events").delete().eq("id", input.eventId);

  if (input.style === "shared") {
    if (!input.householdId) return syncErr("HOUSEHOLD_REQUIRED");
    query = query.eq("visibility", "household").eq("household_id", input.householdId);
  } else {
    if (!input.userId) return syncErr("USER_REQUIRED");
    query = query.eq("visibility", "individual").eq("user_id", input.userId);
  }

  const { data, error } = await query.select("id");

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to delete planner event", error);
    }
    return syncErr(
      isMissingRelation(error) ? "SCHEMA_DELETE_CALENDAR" : errorMessage(error),
    );
  }

  if (!data?.length) {
    return syncErr("EVENT_DELETE_NOT_FOUND");
  }

  return syncOk();
}

export async function deletePlannerTaskSynced(input: {
  householdId: string | null;
  taskId: string;
}): Promise<PlannerSyncResult> {
  if (!input.householdId) return syncErr("HOUSEHOLD_REQUIRED");
  const supabase = getBrowserClient();
  if (!supabase) return syncErr("SUPABASE_MISSING");

  const { error } = await supabase
    .from("household_tasks")
    .delete()
    .eq("household_id", input.householdId)
    .eq("id", input.taskId);

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to delete planner task", error);
    }
    return syncErr(
      isMissingRelation(error) ? "SCHEMA_DELETE_TASKS" : errorMessage(error),
    );
  }

  return syncOk();
}

export async function fetchOpenHouseholdTaskCount(householdId: string | null) {
  if (!householdId) return 0;
  const supabase = getBrowserClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("household_tasks")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("is_done", false);

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("Failed to fetch open household task count", error);
    }
    return 0;
  }

  return Number(count ?? 0);
}

export function subscribePlannerState(
  householdId: string | null,
  userId: string | null,
  onChange: () => void,
): (() => void) | undefined {
  const supabase = getBrowserClient();
  if (!supabase) return undefined;
  if (!householdId && !userId) return undefined;

  const channel = supabase.channel(`planner:${householdId ?? userId ?? "anon"}`);

  if (householdId) {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "calendar_events",
        filter: `household_id=eq.${householdId}`,
      },
      onChange,
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "household_tasks",
        filter: `household_id=eq.${householdId}`,
      },
      onChange,
    );
  }

  if (userId) {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "calendar_events",
        filter: `user_id=eq.${userId}`,
      },
      onChange,
    );
  }

  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
