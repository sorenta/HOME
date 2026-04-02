"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { formatAppDate } from "@/lib/date-format";
import { getBrowserClient } from "@/lib/supabase/client";
import {
  buildMonthGrid,
  sortByDate,
  writePlannerEvents,
  writePlannerTasks,
  isSameDay,
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
import {
  buildHouseholdActivityFeed,
  fetchHouseholdActivityFeed,
  subscribeHouseholdActivity,
  type ActivityFeedRow,
} from "@/lib/household-activity";

const WEEKDAY_LABELS = {
  lv: ["P", "O", "T", "C", "Pk", "S", "Sv"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
} as const;

function isoForDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
}

export default function EventsPage() {
  const { t, locale } = useI18n();
  const { profile, user } = useAuth();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [activityRows, setActivityRows] = useState<ActivityFeedRow[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => isoForDate(new Date()));
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(() => isoForDate(new Date()));
  const [eventStyle, setEventStyle] = useState<"shared" | "personal">("shared");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(() => isoForDate(new Date()));
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function mapSyncMessage(msg: string) {
    const dictKey = `events.sync.${msg}`;
    const translated = t(dictKey);
    if (translated !== dictKey) return translated;
    if (msg.length > 2 && !msg.includes("_")) return msg;
    return t("events.sync.generic");
  }

  async function reloadPlannerFromRemote() {
    const state = await loadPlannerStateSynced({
      householdId: profile?.household_id ?? null,
      userId: user?.id ?? null,
      memberNameById,
      fallbackMemberName: t("events.todo.unassigned"),
    });
    setEvents(sortByDate(state.events));
    setTasks(sortByDate(state.tasks));
    writePlannerEvents(state.events);
    writePlannerTasks(state.tasks);
  }

  useEffect(() => {
    let alive = true;

    const loadMembers = async () => {
      const fetched = await fetchMyHouseholdMembers();
      if (!alive) return;

      setMembers(fetched);
      if (fetched.length > 0) {
        setTaskAssigneeId((current) => current || fetched[0].id);
      } else {
        setTaskAssigneeId("");
      }
    };

    void loadMembers();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setEventDate(selectedDate);
    setTaskDueDate(selectedDate);
  }, [selectedDate]);

  const memberNameById = useMemo(
    () =>
      Object.fromEntries(
        members.map((member) => [member.id, member.display_name ?? t("events.todo.unassigned")]),
      ),
    [members, t],
  );

  useEffect(() => {
    let alive = true;
    const frame = window.requestAnimationFrame(() => {
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
    });

    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
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

  useEffect(() => {
    if (!profile?.household_id) {
      const frame = window.requestAnimationFrame(() => {
        setActivityRows([]);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    let alive = true;
    void fetchHouseholdActivityFeed(profile.household_id).then((rows) => {
      if (alive) {
        setActivityRows(rows);
      }
    });

    const unsubscribe = subscribeHouseholdActivity(profile.household_id, () => {
      void fetchHouseholdActivityFeed(profile.household_id!).then((rows) => {
        if (alive) {
          setActivityRows(rows);
        }
      });
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [profile?.household_id]);

  const nextEvent = events[0] ?? null;
  const sharedEvents = useMemo(
    () => events.filter((item) => item.style === "shared"),
    [events],
  );
  const personalEvents = useMemo(
    () => events.filter((item) => item.style === "personal"),
    [events],
  );
  const openTasks = useMemo(() => tasks.filter((item) => !item.done), [tasks]);
  const calendarDays = useMemo(() => buildMonthGrid(calendarMonth), [calendarMonth]);
  const selectedDayEvents = useMemo(
    () => events.filter((item) => item.date === selectedDate),
    [events, selectedDate],
  );
  const selectedDayTasks = useMemo(
    () => tasks.filter((item) => item.dueDate === selectedDate),
    [tasks, selectedDate],
  );
  const feedItems = useMemo(
    () =>
      buildHouseholdActivityFeed(
        activityRows,
        members,
        locale,
        t("events.todo.unassigned"),
        6,
      ),
    [activityRows, locale, members, t],
  );
  const monthLabel = new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);

  useEffect(() => {
    const selected = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(selected.getTime())) return;
    if (
      selected.getFullYear() !== calendarMonth.getFullYear() ||
      selected.getMonth() !== calendarMonth.getMonth()
    ) {
      const frame = window.requestAnimationFrame(() => {
        setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [calendarMonth, selectedDate]);

  function goToToday() {
    const now = new Date();
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    const iso = isoForDate(now);
    setSelectedDate(iso);
    setEventDate(iso);
    setTaskDueDate(iso);
  }

  async function addEvent() {
    setFormError(null);
    if (!eventTitle.trim() || !eventDate) return;

    const client = getBrowserClient();
    if (!client) {
      const nextEvents = sortByDate([
        ...events,
        {
          id: crypto.randomUUID(),
          title: eventTitle.trim(),
          date: eventDate,
          style: eventStyle,
        },
      ]);
      setEvents(nextEvents);
      writePlannerEvents(nextEvents);
      setEventTitle("");
      setEventStyle("shared");
      setEventDate(selectedDate);
      return;
    }

    const res = await addPlannerEventSynced({
      householdId: profile?.household_id ?? null,
      userId: user?.id ?? null,
      title: eventTitle,
      date: eventDate,
      style: eventStyle,
    });
    if (!res.ok) {
      setFormError(mapSyncMessage(res.message));
      return;
    }
    await reloadPlannerFromRemote();
    setEventTitle("");
    setEventStyle("shared");
    setEventDate(selectedDate);
  }

  async function addTask() {
    setFormError(null);
    if (!taskTitle.trim() || !taskDueDate) return;
    if (!profile?.household_id) {
      setFormError(mapSyncMessage("HOUSEHOLD_REQUIRED"));
      return;
    }
    if (members.length === 0) {
      setFormError(t("events.todo.needHousehold"));
      return;
    }

    const assignee = members.find((member) => member.id === taskAssigneeId);
    const assigneeId = taskAssigneeId || members[0]?.id || "";

    const client = getBrowserClient();
    if (!client) {
      const nextTasks = sortByDate([
        ...tasks,
        {
          id: crypto.randomUUID(),
          title: taskTitle.trim(),
          assigneeId,
          assigneeName: assignee?.display_name ?? t("events.todo.unassigned"),
          dueDate: taskDueDate,
          done: false,
        },
      ]);
      setTasks(nextTasks);
      writePlannerTasks(nextTasks);
      setTaskTitle("");
      setTaskDueDate(selectedDate);
      return;
    }

    const res = await addPlannerTaskSynced({
      householdId: profile.household_id,
      userId: user?.id ?? null,
      title: taskTitle,
      assigneeId,
      dueDate: taskDueDate,
    });
    if (!res.ok) {
      setFormError(mapSyncMessage(res.message));
      return;
    }
    await reloadPlannerFromRemote();
    setTaskTitle("");
    setTaskDueDate(selectedDate);
  }

  async function toggleTask(taskId: string) {
    setFormError(null);
    const prevTasks = tasks;
    const nextTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, done: !item.done } : item,
    );
    setTasks(nextTasks);
    writePlannerTasks(nextTasks);
    const current = nextTasks.find((item) => item.id === taskId);
    if (!current) return;

    const client = getBrowserClient();
    if (!client) return;

    const res = await togglePlannerTaskSynced({
      householdId: profile?.household_id ?? null,
      taskId,
      done: current.done,
    });
    if (!res.ok) {
      setTasks(prevTasks);
      writePlannerTasks(prevTasks);
      setFormError(mapSyncMessage(res.message));
      return;
    }
    await reloadPlannerFromRemote();
  }

  async function removeEvent(eventId: string) {
    setFormError(null);
    const client = getBrowserClient();
    if (!client) {
      const next = events.filter((e) => e.id !== eventId);
      setEvents(next);
      writePlannerEvents(next);
      return;
    }
    const res = await deletePlannerEventSynced({ eventId });
    if (!res.ok) {
      setFormError(mapSyncMessage(res.message));
      return;
    }
    await reloadPlannerFromRemote();
  }

  async function removeTask(taskId: string) {
    setFormError(null);
    const hid = profile?.household_id ?? null;
    const client = getBrowserClient();
    if (!client) {
      const next = tasks.filter((x) => x.id !== taskId);
      setTasks(next);
      writePlannerTasks(next);
      return;
    }
    if (!hid) {
      setFormError(mapSyncMessage("HOUSEHOLD_REQUIRED"));
      return;
    }
    const res = await deletePlannerTaskSynced({ householdId: hid, taskId });
    if (!res.ok) {
      setFormError(mapSyncMessage(res.message));
      return;
    }
    await reloadPlannerFromRemote();
  }

  return (
    <ModuleShell title={t("tile.calendarEvents")} moduleId="calendar">
      {formError ? (
        <GlassPanel className="border border-rose-400/35 bg-[color-mix(in_srgb,var(--color-surface)_88%,#fecaca)]">
          <p className="text-sm text-[color:var(--color-text)]">{formError}</p>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="mt-2 text-xs font-medium text-[color:var(--color-secondary)] underline"
          >
            {locale === "lv" ? "Aizvērt" : "Dismiss"}
          </button>
        </GlassPanel>
      ) : null}
      <GlassPanel className="space-y-4">
        <SectionHeading
          eyebrow={t("tile.events")}
          title={t("events.overview")}
          detail={nextEvent ? formatAppDate(nextEvent.date, locale) ?? "" : ""}
        />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("module.events.blurb")}
        </p>
        {nextEvent ? (
          <div className="rounded-3xl border border-[color:var(--color-surface-border)] bg-[linear-gradient(180deg,var(--color-surface),transparent)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
                  {t("events.next")}
                </p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--color-text)]">
                  {nextEvent.title}
                </p>
                <p className="mt-1 text-sm text-[color:var(--color-secondary)]">
                  {formatAppDate(nextEvent.date, locale)}
                </p>
              </div>
              <StatusPill tone={nextEvent.style === "shared" ? "good" : "neutral"}>
                {nextEvent.style === "shared"
                  ? t("events.shared")
                  : t("events.personal")}
              </StatusPill>
            </div>
            <p className="mt-4 text-sm font-medium text-[color:var(--color-text)]">
              {t("events.nextHint")}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard label={t("events.total")} value={events.length} />
          <MetricCard label={t("events.shared")} value={sharedEvents.length} />
          <MetricCard label={t("events.personal")} value={personalEvents.length} />
          <MetricCard label={t("events.todo.open")} value={openTasks.length} />
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeading title={t("events.calendar")} detail={formatAppDate(selectedDate, locale) ?? ""} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => goToToday()}
              className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)]"
            >
              {t("events.today")}
            </button>
            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                )
              }
              className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm"
            >
              ←
            </button>
            <p className="min-w-32 text-center text-sm font-medium capitalize text-[color:var(--color-text)]">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                )
              }
              className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm"
            >
              →
            </button>
          </div>
        </div>
        <p className="text-sm text-[color:var(--color-secondary)]">{t("events.calendarHint")}</p>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAY_LABELS[locale].map((label) => (
              <p
                key={label}
                className="text-center text-[0.7rem] font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]"
              >
                {label}
              </p>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`blank-${index}`}
                    className="aspect-square rounded-2xl border border-transparent"
                  />
                );
              }

              const dayEvents = events.filter((item) => isSameDay(day, item.date));
              const dayTasks = tasks.filter((item) => isSameDay(day, item.dueDate));
              const dayIso = isoForDate(day);
              const isSelected = dayIso === selectedDate;
              const isToday = dayIso === isoForDate(new Date());

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(dayIso)}
                  className={[
                    "aspect-square rounded-2xl border p-2 text-left transition-colors",
                    isSelected
                      ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface)]"
                      : "border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/45",
                  ].join(" ")}
                >
                  <div className="flex h-full flex-col">
                    <span
                      className={[
                        "text-sm font-semibold",
                        isToday ? "text-[color:var(--color-primary)]" : "text-[color:var(--color-text)]",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>
                    <div className="mt-auto flex flex-wrap gap-1">
                      {dayEvents.slice(0, 2).map((item) => (
                        <span
                          key={item.id}
                          className="h-2 w-2 rounded-full bg-[color:var(--color-primary)]"
                          title={item.title}
                        />
                      ))}
                      {dayTasks.slice(0, 2).map((item) => (
                        <span
                          key={item.id}
                          className={[
                            "h-2 w-2 rounded-full",
                            item.done
                              ? "bg-[color:var(--color-secondary)]"
                              : "bg-[color:var(--color-accent)]",
                          ].join(" ")}
                          title={item.title}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/35 p-3">
            <SectionHeading title={t("events.selectedDay")} detail={formatAppDate(selectedDate, locale) ?? ""} />
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
                  {t("events.dayEvents")}
                </p>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-secondary)]">{t("events.dayEmpty")}</p>
                ) : (
                  selectedDayEvents.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-[color:var(--color-text)]">{item.title}</p>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusPill tone={item.style === "shared" ? "good" : "neutral"}>
                            {item.style === "shared" ? t("events.shared") : t("events.personal")}
                          </StatusPill>
                          <button
                            type="button"
                            onClick={() => void removeEvent(item.id)}
                            className="rounded-lg px-2 py-1 text-xs text-[color:var(--color-secondary)] underline"
                          >
                            {t("events.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
                  {t("events.dayTasks")}
                </p>
                {selectedDayTasks.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-secondary)]">{t("events.dayEmpty")}</p>
                ) : (
                  selectedDayTasks.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={[
                            "font-medium text-[color:var(--color-text)]",
                            item.done ? "line-through opacity-60" : "",
                          ].join(" ")}
                        >
                          {item.title}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusPill tone={item.done ? "neutral" : "good"}>
                            {item.assigneeName}
                          </StatusPill>
                          <button
                            type="button"
                            onClick={() => void removeTask(item.id)}
                            className="rounded-lg px-2 py-1 text-xs text-[color:var(--color-secondary)] underline"
                          >
                            {t("events.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("events.upcoming")} />
        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-[color:var(--color-secondary)]">{t("events.empty")}</p>
            ) : (
              events.map((item) => (
                <div
                  key={item.id}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3 text-left"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[color:var(--color-text)]">
                        {item.title}
                      </p>
                      <StatusPill tone={item.style === "shared" ? "good" : "neutral"}>
                        {item.style === "shared"
                          ? t("events.shared")
                          : t("events.personal")}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                      {formatAppDate(item.date, locale)}
                    </p>
                  </button>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <StatusPill tone={item.style === "shared" ? "good" : "neutral"}>
                      {t("events.calendarTag")}
                    </StatusPill>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeEvent(item.id);
                      }}
                      className="text-xs text-[color:var(--color-secondary)] underline"
                    >
                      {t("events.delete")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="space-y-3 rounded-2xl border border-[color:var(--color-surface-border)] p-3">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("events.add")}
            </p>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder={t("events.form.title")}
              className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
            />
            <input
              type="date"
              lang={locale === "lv" ? "lv-LV" : "en-US"}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
            />
            <p className="text-xs text-[color:var(--color-secondary)]">{t("events.form.date")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEventStyle("shared")}
                className={[
                  "rounded-xl border px-3 py-2 text-sm",
                  eventStyle === "shared"
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface)]"
                    : "border-[color:var(--color-surface-border)]",
                ].join(" ")}
              >
                {t("events.shared")}
              </button>
              <button
                type="button"
                onClick={() => setEventStyle("personal")}
                className={[
                  "rounded-xl border px-3 py-2 text-sm",
                  eventStyle === "personal"
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface)]"
                    : "border-[color:var(--color-surface-border)]",
                ].join(" ")}
              >
                {t("events.personal")}
              </button>
            </div>
            <button
              type="button"
              onClick={() => void addEvent()}
              className="w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)]"
            >
              {t("events.form.save")}
            </button>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("events.todo.title")} detail={openTasks.length.toString()} />
        {profile?.household_id && members.length === 0 ? (
          <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
            {t("events.todo.needHousehold")}
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-[color:var(--color-secondary)]">{t("events.todo.empty")}</p>
            ) : (
              tasks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => void toggleTask(item.id)}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={[
                          "font-medium text-[color:var(--color-text)]",
                          item.done ? "line-through opacity-60" : "",
                        ].join(" ")}
                      >
                        {item.title}
                      </p>
                      <StatusPill tone={item.done ? "neutral" : "good"}>
                        {item.assigneeName}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                      {formatAppDate(item.dueDate, locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeTask(item.id)}
                    className="shrink-0 text-xs text-[color:var(--color-secondary)] underline"
                  >
                    {t("events.delete")}
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="space-y-3 rounded-2xl border border-[color:var(--color-surface-border)] p-3">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("events.todo.add")}
            </p>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder={t("events.todo.form.title")}
              className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
            />
            <select
              value={taskAssigneeId}
              onChange={(e) => setTaskAssigneeId(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.display_name ?? t("events.todo.unassigned")}
                </option>
              ))}
            </select>
            <p className="text-xs text-[color:var(--color-secondary)]">{t("events.todo.form.assignee")}</p>
            <input
              type="date"
              lang={locale === "lv" ? "lv-LV" : "en-US"}
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
            />
            <p className="text-xs text-[color:var(--color-secondary)]">{t("events.todo.form.date")}</p>
            <button
              type="button"
              onClick={() => void addTask()}
              disabled={!profile?.household_id || members.length === 0}
              className={[
                "w-full rounded-xl px-4 py-3 text-sm font-semibold",
                !profile?.household_id || members.length === 0
                  ? "cursor-not-allowed opacity-50 bg-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]"
                  : "bg-[color:var(--color-primary)] text-[color:var(--color-background)]",
              ].join(" ")}
            >
              {t("events.todo.form.save")}
            </button>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("events.celebration")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("events.plan.sharedTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-secondary)]">
              {t("events.plan.sharedBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("events.plan.personalTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-secondary)]">
              {t("events.plan.personalBody")}
            </p>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("events.feed")} detail={feedItems.length.toString()} />
        <div className="space-y-3">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
            >
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--color-primary)]" />
              <div className="min-w-0">
                <p className="text-sm text-[color:var(--color-text)]">
                  {item.line}
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </ModuleShell>
  );
}
