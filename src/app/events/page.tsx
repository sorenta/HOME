"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { EventsThemeLayer } from "@/components/events/events-theme-layer";
import { GlassPanel } from "@/components/ui/glass-panel";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { UpcomingEventCard } from "@/components/events/upcoming-event-card";
import { CalendarGrid } from "@/components/events/calendar-grid";
import { DayEventsList } from "@/components/events/day-events-list";
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
} from "@/lib/events-planner";
import { useI18n } from "@/lib/i18n/i18n-context";
import { fetchMyHouseholdMembers, type HouseholdMember } from "@/lib/household";
import { useAuth } from "@/components/providers/auth-provider";
import {
  addPlannerEventSynced,
  addPlannerTaskSynced,
  deletePlannerEventSynced,
  deletePlannerTaskSynced,
  loadPlannerStateSynced,
  subscribePlannerState,
  togglePlannerTaskSynced,
} from "@/lib/events-sync";

function isoForDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function eventTypeFromTitle(title: string, t: (key: string) => string) {
  const value = title.toLowerCase();
  if (value.includes("dzim") || value.includes("birthday")) return t("events.type.birthday");
  if (value.includes("atg") || value.includes("remind")) return t("events.type.reminder");
  if (value.includes("darb") || value.includes("homework")) return t("events.type.homework");
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
    void loadPlannerStateSynced({
      householdId: profile?.household_id ?? null,
      userId: user?.id ?? null,
      memberNameById,
      fallbackMemberName: t("events.todo.unassigned"),
    }).then((state) => {
      if (!alive) return;
      setEvents(sortByDate(state.events));
      setTasks(sortByDate(state.tasks));
    });

    return () => {
      alive = false;
    };
  }, [memberNameById, profile?.household_id, t, user?.id]);

  useEffect(() => {
    const unsubscribe = subscribePlannerState(profile?.household_id ?? null, user?.id ?? null, () => {
      void loadPlannerStateSynced({
        householdId: profile?.household_id ?? null,
        userId: user?.id ?? null,
        memberNameById,
        fallbackMemberName: t("events.todo.unassigned"),
      }).then((state) => {
        setEvents(sortByDate(state.events));
        setTasks(sortByDate(state.tasks));
      });
    });

    return () => {
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
        typeLabel: eventTypeFromTitle(item.title, t),
        note: t("events.plannedEntry"),
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
      dateLabel: formatAppDate(nextEvent.date, locale) ?? nextEvent.date,
      countdownLabel: countdownLabel(nextEvent.date, t),
      typeLabel: eventTypeFromTitle(nextEvent.title, t),
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
    setEvents(sortByDate(state.events));
    setTasks(sortByDate(state.tasks));
  }

  async function handleQuickAdd(kind: "event" | "reminder" | "birthday" | "homework" | "personal" | "shared") {
    setFormError(null);

    const todayLabel = formatAppDate(selectedDate, locale) ?? selectedDate;
    const baseTitle = {
      event: `${t("events.entry.event")} · ${todayLabel}`,
      reminder: `${t("events.entry.reminder")} · ${todayLabel}`,
      birthday: `${t("events.entry.birthday")} · ${todayLabel}`,
      homework: `${t("events.entry.homework")} · ${todayLabel}`,
      personal: `${t("events.entry.personal")} · ${todayLabel}`,
      shared: `${t("events.entry.shared")} · ${todayLabel}`,
    }[kind];

    if (kind === "homework") {
      if (!profile?.household_id) {
        setFormError(mapSyncMessage("HOUSEHOLD_REQUIRED"));
        return;
      }

      const assigneeId = members[0]?.id ?? "";
      const assigneeName = members[0]?.display_name ?? t("events.todo.unassigned");
      const client = getBrowserClient();

      if (!client) {
        const nextTasks = sortByDate([
          ...tasks,
          {
            id: crypto.randomUUID(),
            title: baseTitle,
            assigneeId,
            assigneeName,
            dueDate: selectedDate,
            done: false,
          },
        ]);
        setTasks(nextTasks);
        writePlannerTasks(nextTasks);
        return;
      }

      const response = await addPlannerTaskSynced({
        householdId: profile.household_id,
        userId: user?.id ?? null,
        title: baseTitle,
        assigneeId,
        dueDate: selectedDate,
      });
      if (!response.ok) {
        setFormError(mapSyncMessage(response.message));
        return;
      }
      await reloadPlanner();
      return;
    }

    const style: PlannerEvent["style"] =
      kind === "personal" ? "personal" : kind === "shared" ? "shared" : "shared";
    const client = getBrowserClient();

    if (!client) {
      const nextEvents = sortByDate([
        ...events,
        {
          id: crypto.randomUUID(),
          title: baseTitle,
          date: selectedDate,
          style,
        },
      ]);
      setEvents(nextEvents);
      writePlannerEvents(nextEvents);
      return;
    }

    const response = await addPlannerEventSynced({
      householdId: profile?.household_id ?? null,
      userId: user?.id ?? null,
      title: baseTitle,
      date: selectedDate,
      style,
    });

    if (!response.ok) {
      setFormError(mapSyncMessage(response.message));
      return;
    }

    await reloadPlanner();
  }

  async function handleToggleTask(taskId: string, done: boolean) {
    setFormError(null);
    const client = getBrowserClient();

    if (!client || !profile?.household_id) {
      const nextTasks = sortByDate(tasks.map((item) => (item.id === taskId ? { ...item, done } : item)));
      setTasks(nextTasks);
      writePlannerTasks(nextTasks);
      return;
    }

    const response = await togglePlannerTaskSynced({
      householdId: profile.household_id,
      taskId,
      done,
    });

    if (!response.ok) {
      setFormError(mapSyncMessage(response.message));
      return;
    }

    await reloadPlanner();
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
    setFormError(t("events.quickAddEditOpened"));
    setIsAddMenuOpen(true);
  }

  const selectedDateLabel = formatAppDate(selectedDate, locale) ?? selectedDate;

  return (
    <ModuleShell title={t("tile.calendarEvents")} moduleId="calendar">
      <EventsThemeLayer>
        <HiddenSeasonalCollectible spotId="events" />

        {formError ? (
          <GlassPanel className="space-y-2">
            <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
              {formError}
            </p>
          </GlassPanel>
        ) : null}

        <GlassPanel className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-accent)" }}>
            {t("events.hero")}
          </p>
          <UpcomingEventCard
            event={upcomingDetails}
            onOpen={onOpenUpcoming}
            onEdit={onEditUpcoming}
            onCreate={() => setIsAddMenuOpen(true)}
          />
        </GlassPanel>

        <GlassPanel className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <CalendarGrid
              locale={locale}
              calendarMonth={calendarMonth}
              selectedDate={selectedDate}
              todayIso={isoForDate(new Date())}
              indicatorsByDate={indicatorsByDate}
              onSelectDate={(iso) => {
                setSelectedDate(iso);
                const day = new Date(`${iso}T00:00:00`);
                if (!Number.isNaN(day.getTime())) {
                  setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                }
              }}
              onShiftMonth={(offset) =>
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1),
                )
              }
              onGoToToday={() => {
                const now = new Date();
                setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedDate(isoForDate(now));
              }}
              monthDays={monthDays}
            />

            <DayEventsList
              selectedDate={selectedDate}
              selectedDateLabel={selectedDateLabel}
              items={selectedDayItems}
              onToggleTask={(taskId, done) => {
                void handleToggleTask(taskId, done);
              }}
              onDeleteEvent={(eventId) => {
                void handleDeleteEvent(eventId);
              }}
              onDeleteTask={(taskId) => {
                void handleDeleteTask(taskId);
              }}
            />
          </div>
        </GlassPanel>

        <EventAddMenu
          isOpen={isAddMenuOpen}
          onClose={() => setIsAddMenuOpen(false)}
          onSelect={(kind) => {
            void handleQuickAdd(kind);
          }}
        />
      </EventsThemeLayer>
    </ModuleShell>
  );
}
