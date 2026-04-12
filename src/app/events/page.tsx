"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { EventsThemeLayer } from "@/components/events/events-theme-layer";
import { GlassPanel } from "@/components/ui/glass-panel";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { UpcomingEventCard } from "@/components/events/upcoming-event-card";
import { CalendarGrid } from "@/components/events/calendar-grid";
import { LucentWeeklyGrid } from "@/components/dashboard/lucent/LucentWeeklyGrid";
import { DayEventsList, type DayEntry } from "@/components/events/day-events-list";
import { LucentWeekEventsList } from "@/components/events/lucent-week-events-list";
import { EventAddMenu } from "@/components/events/event-add-menu";
import { formatAppDate } from "@/lib/date-format";
import { getBrowserClient } from "@/lib/supabase/client";
import {
  buildMonthGrid,
  sortByDate,
  writePlannerEvents,
  writePlannerTasks,
  type PlannerEvent,
  type PlannerTask,
  type EventKind,
} from "@/lib/events-planner";
import { useI18n } from "@/lib/i18n/i18n-context";
import { fetchMyHouseholdMembers, type HouseholdMember } from "@/lib/household";
import { ForgeEventsLayout } from "@/components/events/layouts/forge-layout";
import { LucentEventsLayout } from "@/components/events/layouts/lucent-layout";
import { DefaultEventsLayout } from "@/components/events/layouts/default-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { UpcomingEventForge } from "@/components/events/forge/UpcomingEventForge";
import { ForgeWeeklyGrid } from "@/components/events/forge/ForgeWeeklyGrid";
import { EventForm } from "@/components/events/event-form";
import { useSearchParams } from "next/navigation";
import {
  addPlannerEventSynced,
  addPlannerTaskSynced,
  deletePlannerEventSynced,
  deletePlannerTaskSynced,
  loadPlannerStateSynced,
  subscribePlannerState,
  togglePlannerTaskSynced,
  updatePlannerEventSynced
} from "@/lib/events-sync";

import { useThemeActionEffects } from "@/components/theme/theme-action-effects";

function isoForDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function eventTypeFromTitle(title: string, t: (key: string) => string, kind?: string) {
  if (kind && kind !== "event") {
    const dictKey = `events.type.${kind}`;
    const translated = t(dictKey);
    return translated !== dictKey ? translated : kind;
  }
  const value = title.toLowerCase();
  if (value.includes("dzim") || value.includes("birthday")) return t("events.type.birthday");
  if (value.includes("atg") || value.includes("remind")) return t("events.type.reminder");
  if (value.includes("darb") || value.includes("homework")) return t("events.type.homework");
  if (value.includes("vārda") || value.includes("nameday")) return t("events.type.nameday");
  return t("events.type.event");
}

function countdownLabel(isoDate: string, t: (key: string, vars?: Record<string, string>) => string) {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(`${isoDate}T00:00:00`).getTime();
  const diff = Math.round((target - from) / 86400000);

  if (diff <= 0) return t("events.today");
  if (diff === 1) return t("events.tomorrow");
  return t("events.inDays", { n: String(diff) });
}

export default function EventsPage() {
  const { t, locale } = useI18n();
  const { profile, user } = useAuth();
  const { triggerThemeActionEffect } = useThemeActionEffects();
  const searchParams = useSearchParams();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => isoForDate(new Date()));
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [activeForgeForm, setActiveForgeForm] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<DayEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading || !profile?.household_id) return;
    const action = searchParams.get("action");
    if (action === "add-event") {
      setTimeout(() => {
        setIsAddMenuOpen(true);
        window.history.replaceState({}, "", "/events");
      }, 0);
    }
  }, [loading, profile?.household_id, searchParams]);

  const memberNameById = useMemo(
    () =>
      Object.fromEntries(
        members.map((member) => [member.id, member.display_name ?? t("events.todo.unassigned")]),
      ),
    [members, t],
  );

  function mapSyncMessage(msg: string) {
    const dictKey = `events.sync.${msg}`;
    const translated = t(dictKey);
    if (translated !== dictKey) return translated;
    if (msg.length > 2 && !msg.includes("_")) return msg;
    return t("events.sync.generic");
  }

  useEffect(() => {
    let alive = true;

    void fetchMyHouseholdMembers().then((fetched) => {
      if (!alive) return;
      setMembers(fetched);
    });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    // Helper to filter out meals and "Vakariņas" from the calendar view
    const isMeal = (title: string, kind?: string) => 
      kind === "meal" || 
      title.toLowerCase().includes("vakariņas") || 
      title.toLowerCase().includes("recept:");

    const syncPlannerState = async () => {
      const state = await loadPlannerStateSynced({
        householdId: profile?.household_id ?? null,
        userId: user?.id ?? null,
        memberNameById,
        fallbackMemberName: t("events.todo.unassigned"),
      });
      if (!alive) return;

      const filteredEvents = state.events.filter(e => !isMeal(e.title, e.kind));
      const filteredTasks = state.tasks.filter(t => !isMeal(t.title));

      setEvents(sortByDate(filteredEvents));
      setTasks(sortByDate(filteredTasks));
      setLoading(false);
    };

    // Initial load
    void syncPlannerState();

    // Subscribe to real-time updates
    const unsubscribe = subscribePlannerState(profile?.household_id ?? null, user?.id ?? null, () => {
      void syncPlannerState();
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [memberNameById, profile?.household_id, t, user?.id]);

  const monthDays = useMemo(() => buildMonthGrid(calendarMonth), [calendarMonth]);

  const indicatorsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of events) counts[item.date] = (counts[item.date] ?? 0) + 1;
    for (const item of tasks) counts[item.dueDate] = (counts[item.dueDate] ?? 0) + 1;
    return counts;
  }, [events, tasks]);

  const nextEvent = useMemo(() => {
    const todayIso = isoForDate(new Date());
    return events.find((item) => item.date >= todayIso) ?? events[0] ?? null;
  }, [events]);

  const selectedDayItems = useMemo(() => {
    const dayEvents = events
      .filter((item) => item.date === selectedDate)
      .map((item) => ({
        id: `event-${item.id}`,
        sourceId: item.id,
        kind: "event" as const,
        title: item.title,
        timeLabel: t("events.allDay"),
        typeLabel: eventTypeFromTitle(item.title, t, item.kind),
        note: "",
        style: item.style,
      }));

    const dayTasks = tasks
      .filter((item) => item.dueDate === selectedDate)
      .map((item) => ({
        id: `task-${item.id}`,
        sourceId: item.id,
        kind: "task" as const,
        title: item.title,
        timeLabel: t("events.byEndOfDay"),
        typeLabel: t("events.type.homework"),
        note: `${t("events.assigneePrefix")}: ${item.assigneeName}`,
        style: "shared" as const,
        done: item.done,
      }));

    return [...dayEvents, ...dayTasks];
  }, [events, selectedDate, t, tasks]);

  const upcomingDetails = useMemo(() => {
    if (!nextEvent) return null;

    const styleLabel = nextEvent.style === "personal" ? t("events.personal") : t("events.shared");

    return {
      id: nextEvent.id,
      title: nextEvent.title,
      date: nextEvent.date,
      dateLabel: formatAppDate(nextEvent.date, locale) ?? nextEvent.date,
      countdownLabel: countdownLabel(nextEvent.date, t),
      typeLabel: eventTypeFromTitle(nextEvent.title, t, nextEvent.kind),
      style: nextEvent.style,
      styleLabel,
      location: nextEvent.style === "personal" ? t("events.personal") : t("events.sharedSpace"),
      note: t("events.dayContextHint"),
      timeLabel: t("events.allDay"),
    };
  }, [locale, nextEvent, t]);

  async function reloadPlanner() {
    const state = await loadPlannerStateSynced({
      householdId: profile?.household_id ?? null,
      userId: user?.id ?? null,
      memberNameById,
      fallbackMemberName: t("events.todo.unassigned"),
    });
    // Filter out meal events - they should only be visible in the Kitchen section
    const filteredEvents = state.events.filter(e => e.kind !== "meal");
    setEvents(sortByDate(filteredEvents));
    setTasks(sortByDate(state.tasks));
  }

  async function handleForgeSave(title: string, note?: string, date?: string, time?: string, isRecurring?: boolean, assigneeId?: string) {
    if (!activeForgeForm) return;
    const kind = activeForgeForm as EventKind;
    const isUpdate = Boolean(editingItem);

    setActiveForgeForm(null);
    setEditingItem(null);
    setFormError(null);

    const style: PlannerEvent["style"] =
      (kind === "shared" || kind === "homework") ? "shared" : "personal";

    const targetDate = date || selectedDate;

    if (kind === "homework") {
      if (!profile?.household_id) {
        setFormError(mapSyncMessage("HOUSEHOLD_REQUIRED"));
        return;
      }

      const selectedMember = members.find(m => m.id === assigneeId) || members[0];

      if (isUpdate && editingItem?.sourceId) {
        await deletePlannerTaskSynced({ householdId: profile.household_id, taskId: editingItem.sourceId });
      }

      const response = await addPlannerTaskSynced({
        householdId: profile.household_id,
        userId: user?.id ?? null,
        title,
        assigneeId: selectedMember?.id || "",
        dueDate: targetDate,
      });
      if (!response.ok) {
        setFormError(mapSyncMessage(response.message));
        return;
      }
    } else {
      const finalTitle = kind === "birthday" ? (title.startsWith("🎂") ? title : `🎂 ${title}`) : kind === "nameday" ? (title.startsWith("✨") ? title : `✨ ${title}`) : title;
      
      let response;
      if (isUpdate && editingItem?.sourceId) {
        response = await updatePlannerEventSynced({
          eventId: editingItem.sourceId,
          householdId: profile?.household_id ?? null,
          userId: user?.id ?? null,
          title: finalTitle,
          date: targetDate,
          style,
          kind,
          isRecurring: kind === "birthday" ? true : isRecurring,
          event_time: time,
          notes: note
        });
      } else {
        response = await addPlannerEventSynced({
          householdId: profile?.household_id ?? null,
          userId: user?.id ?? null,
          title: finalTitle,
          date: targetDate,
          style,
          kind,
          isRecurring: kind === "birthday" ? true : isRecurring,
          event_time: time,
          notes: note
        });
      }

      if (!response.ok) {
        setFormError(mapSyncMessage(response.message));
        return;
      }
    }

    await reloadPlanner();
    triggerThemeActionEffect({ kind: isUpdate ? "save" : "add", label: title });
  }

  async function handleToggleTask(taskId: string, done: boolean) {
    setFormError(null);
    const client = getBrowserClient();
    const taskTitle = tasks.find((item) => item.id === taskId)?.title ?? t("events.todo.form.save");

    // 1. OPTIMISTIC UI: Atjaunojam sarakstu uzreiz (0ms aizkave)
    const originalTasks = [...tasks];
    const optimisticTasks = sortByDate(tasks.map((item) => (item.id === taskId ? { ...item, done } : item)));
    setTasks(optimisticTasks);

    // Vizuālais efekts "done" atskan uzreiz
    if (done) {
      triggerThemeActionEffect({ kind: "done", label: taskTitle });
    }

    if (!client || !profile?.household_id) {
      writePlannerTasks(optimisticTasks);
      return;
    }

    // 2. Sūtam datus Supabase (fonā)
    const response = await togglePlannerTaskSynced({
      householdId: profile.household_id,
      taskId,
      done,
    });

    if (!response.ok) {
      setFormError(mapSyncMessage(response.message));
      // Ja nofeilo - atgriežam (rollback) vizuāli atpakaļ iepriekšējo stāvokli
      setTasks(originalTasks);
      return;
    }

    // 3. Klusām atjaunojam pārējos datus (piem., sinhronizējot partnera paziņojumus), vizuālais efekts jau bijis
    void reloadPlanner();
  }

  async function handleDeleteEvent(eventId: string) {
    setFormError(null);
    const client = getBrowserClient();

    if (!client) {
      const nextEvents = sortByDate(events.filter((item) => item.id !== eventId));
      setEvents(nextEvents);
      writePlannerEvents(nextEvents);
      return;
    }

    const event = events.find((item) => item.id === eventId);
    if (!event) return;

    const response = await deletePlannerEventSynced({
      eventId,
      style: event.style,
      householdId: profile?.household_id ?? null,
      userId: user?.id ?? null,
    });

    if (!response.ok) {
      setFormError(mapSyncMessage(response.message));
      return;
    }

    await reloadPlanner();
  }

  async function handleDeleteTask(taskId: string) {
    setFormError(null);
    const client = getBrowserClient();

    if (!client || !profile?.household_id) {
      const nextTasks = sortByDate(tasks.filter((item) => item.id !== taskId));
      setTasks(nextTasks);
      writePlannerTasks(nextTasks);
      return;
    }

    const response = await deletePlannerTaskSynced({
      householdId: profile.household_id,
      taskId,
    });

    if (!response.ok) {
      setFormError(mapSyncMessage(response.message));
      return;
    }

    await reloadPlanner();
  }

  function onOpenUpcoming(eventId: string) {
    const found = events.find((item) => item.id === eventId);
    if (!found) return;
    setSelectedDate(found.date);
    const day = new Date(`${found.date}T00:00:00`);
    if (!Number.isNaN(day.getTime())) {
      setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }

  function onEditUpcoming(eventId: string) {
    const found = events.find((item) => item.id === eventId);
    if (!found) return;
    setSelectedDate(found.date);
    const day = new Date(`${found.date}T00:00:00`);
    if (!Number.isNaN(day.getTime())) {
      setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
    setIsAddMenuOpen(true);
  }

  const selectedDateLabel = formatAppDate(selectedDate, locale) ?? selectedDate;

  const layoutProps = {
    upcomingDetails,
    locale,
    calendarMonth,
    selectedDate,
    selectedDateLabel,
    selectedDayItems,
    indicatorsByDate,
    monthDays,
    isoForDate,
    events,
    tasks,
    onSelectDate: (iso: string) => {
      setSelectedDate(iso);
      const day = new Date(`${iso}T00:00:00`);
      if (!Number.isNaN(day.getTime())) {
        setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1));
      }
    },
    onShiftMonth: (offset: number) =>
      setCalendarMonth(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1),
      ),
    onGoToToday: () => {
      const now = new Date();
      setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setSelectedDate(isoForDate(now));
    },
    onToggleTask: (taskId: string, done: boolean) => {
      void handleToggleTask(taskId, done);
    },
    onDeleteEvent: (eventId: string) => {
      void handleDeleteEvent(eventId);
    },
    onDeleteTask: (taskId: string) => {
      void handleDeleteTask(taskId);
    },
    onEditItem: (item: any) => {
      const itemKind = item.kind === "task" ? "homework" : (events.find(e => e.id === item.sourceId)?.kind || "event");
      setEditingItem(item);
      setActiveForgeForm(itemKind);
    },
    onAddClick: () => setIsAddMenuOpen(true),
    onOpenUpcoming,
    onEditUpcoming,
  };

  const { themeId } = useTheme();

  return (
    <ModuleShell
      title={themeId === "forge" ? "Mērķi un uzdevumi" : t("tile.calendarEvents")}
      moduleId="calendar"
      sectionId="calendar"
      description={themeId === "forge" ? "Aktīvo operāciju un mērķu pārvaldība" : t("events.page.description")}
    >
      <EventsThemeLayer>
        <HiddenSeasonalCollectible spotId="events" />

        {formError ? (
          <GlassPanel className="mb-6">
            <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
              {formError}
            </p>
          </GlassPanel>
        ) : null}

        {themeId === "forge" ? (
          <ForgeEventsLayout {...layoutProps} />
        ) : themeId === "lucent" ? (
          <LucentEventsLayout {...layoutProps} />
        ) : (
          <DefaultEventsLayout {...layoutProps} />
        )}

        <EventAddMenu
          isOpen={isAddMenuOpen}
          onClose={() => setIsAddMenuOpen(false)}
          onSelect={(kind) => {
            setIsAddMenuOpen(false);
            setActiveForgeForm(kind);
          }}
        />

        {activeForgeForm && (
          <EventForm
            kind={activeForgeForm}
            locale={locale}
            members={members}
            initialData={editingItem ? {
              title: editingItem.title,
              note: editingItem.note,
              date: selectedDate,
              isRecurring: events.find(e => e.id === editingItem.sourceId)?.isRecurring,
              assigneeId: editingItem.kind === "task" ? tasks.find(t => t.id === editingItem.sourceId)?.assigneeId : undefined
            } : undefined}
            onCancel={() => {
              setActiveForgeForm(null);
              setEditingItem(null);
            }}
            onSave={(title, note, date, time, isRecurring, assigneeId) => {
              void handleForgeSave(title, note, date, time, isRecurring, assigneeId);
            }}
          />
        )}
      </EventsThemeLayer>
    </ModuleShell>
  );
}
