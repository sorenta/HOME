import { GlassPanel } from "@/components/ui/glass-panel";
import { LucentWeeklyGrid } from "@/components/dashboard/lucent/LucentWeeklyGrid";
import { LucentWeekEventsList } from "@/components/events/lucent-week-events-list";
import { DayEventsList, type DayEntry } from "@/components/events/day-events-list";
import type { PlannerEvent, PlannerTask } from "@/lib/events-planner";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  locale: "lv" | "en";
  selectedDate: string;
  selectedDateLabel: string;
  events: PlannerEvent[];
  tasks: PlannerTask[];
  indicatorsByDate: Record<string, number>;
  isoForDate: (date: Date) => string;
  onSelectDate: (iso: string) => void;
  onToggleTask: (taskId: string, done: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditItem: (item: any) => void;
  onAddClick: () => void;
};

export function LucentEventsLayout({
  locale,
  selectedDate,
  selectedDateLabel,
  events,
  tasks,
  indicatorsByDate,
  isoForDate,
  onSelectDate,
  onToggleTask,
  onDeleteEvent,
  onDeleteTask,
  onEditItem,
  onAddClick,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <button 
        onClick={onAddClick}
        className="w-full flex items-center justify-center gap-3 rounded-[2rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-4 sm:p-5 shadow-[0_10px_20px_-5px_rgba(210,200,190,0.3),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80 transition-all hover:scale-[1.01] active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-white/80 dark:border-white/5 shadow-sm flex items-center justify-center text-foreground/50">
          +
        </div>
        <span className="text-sm font-semibold text-foreground/80 tracking-wide">
          {t("events.add")}
        </span>
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel className="space-y-4">
          <LucentWeeklyGrid
            locale={locale}
            selectedDate={selectedDate}
            todayIso={isoForDate(new Date())}
            indicatorsByDate={indicatorsByDate}
            onSelectDate={onSelectDate}
          />
        </GlassPanel>

        <GlassPanel className="space-y-4">
          <LucentWeekEventsList
            selectedDate={selectedDate}
            allEvents={events}
            allTasks={tasks}
            onToggleTask={onToggleTask}
            onDeleteEvent={onDeleteEvent}
            onDeleteTask={onDeleteTask}
            onEditItem={onEditItem}
          />
        </GlassPanel>
      </div>
    </div>
  );
}
