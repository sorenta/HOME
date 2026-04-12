export type EventKind = "event" | "reminder" | "birthday" | "nameday" | "homework" | "personal" | "shared" | "meal";

export type PlannerEvent = {
  id: string;
  title: string;
  date: string;
  style: "shared" | "personal";
  kind?: EventKind;
  isRecurring?: boolean;
};

export type PlannerTask = {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  done: boolean;
};

const EVENTS_KEY = "majapps-planner-events-v1";
const TASKS_KEY = "majapps-planner-tasks-v1";

const DEFAULT_TASKS: PlannerTask[] = [];

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function defaultEvents(): PlannerEvent[] {
  return [];
}

export function readPlannerEvents() {
  return safeRead<PlannerEvent[]>(EVENTS_KEY, defaultEvents());
}

export function writePlannerEvents(events: PlannerEvent[]) {
  safeWrite(EVENTS_KEY, events);
}

export function readPlannerTasks() {
  return safeRead<PlannerTask[]>(TASKS_KEY, DEFAULT_TASKS);
}

export function writePlannerTasks(tasks: PlannerTask[]) {
  safeWrite(TASKS_KEY, tasks);
}

export function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function isSameDay(date: Date, isoDate: string) {
  const target = new Date(`${isoDate}T00:00:00`);
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

export function buildMonthGrid(value: Date) {
  const firstDay = startOfMonth(value);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
  const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, index) => {
    const dayNumber = index - firstWeekday + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return new Date(value.getFullYear(), value.getMonth(), dayNumber);
  });
}

export function sortByDate<T extends { date?: string; dueDate?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const left = new Date(`${(a.date ?? a.dueDate) || ""}T00:00:00`).getTime();
    const right = new Date(`${(b.date ?? b.dueDate) || ""}T00:00:00`).getTime();
    return left - right;
  });
}
