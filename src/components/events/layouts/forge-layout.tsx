import { GlassPanel } from "@/components/ui/glass-panel";
import { UpcomingEventForge } from "@/components/events/forge/UpcomingEventForge";
import { ForgeWeeklyGrid } from "@/components/events/forge/ForgeWeeklyGrid";
import { DayEventsList, type DayEntry } from "@/components/events/day-events-list";
import type { PlannerEvent, PlannerTask } from "@/lib/events-planner";

type Props = {
  upcomingDetails: any;
  locale: "lv" | "en";
  selectedDate: string;
  selectedDateLabel: string;
  selectedDayItems: DayEntry[];
  indicatorsByDate: Record<string, number>;
  isoForDate: (date: Date) => string;
  onSelectDate: (iso: string) => void;
  onToggleTask: (taskId: string, done: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditItem: (item: DayEntry) => void;
  onAddClick: () => void;
};

export function ForgeEventsLayout({
  upcomingDetails,
  locale,
  selectedDate,
  selectedDateLabel,
  selectedDayItems,
  indicatorsByDate,
  isoForDate,
  onSelectDate,
  onToggleTask,
  onDeleteEvent,
  onDeleteTask,
  onEditItem,
  onAddClick,
}: Props) {
  return (
    <div className="space-y-10">
      {/* SECTOR 01: TEMPORAL ANALYSIS */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Laika analīze</span>
        </div>
        <GlassPanel className="p-4 bg-black/20 backdrop-blur-xl border-white/5 rounded-sm">
          {upcomingDetails ? (
            <UpcomingEventForge event={upcomingDetails} />
          ) : (
            <div className="py-8 text-center opacity-20 text-[0.6rem] font-black uppercase tracking-widest">
              Nav gaidāmu notikumu
            </div>
          )}
        </GlassPanel>
      </div>

      {/* SECTOR 02: MATRIX GRID */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Nedēļas skats</span>
        </div>
        <ForgeWeeklyGrid
          locale={locale}
          selectedDate={selectedDate}
          todayIso={isoForDate(new Date())}
          indicatorsByDate={indicatorsByDate}
          onSelectDate={onSelectDate}
        />
      </div>

      {/* SECTOR 03: DAILY OPERATIONS LOG */}
      <div className="space-y-3 pb-12">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Dienas žurnāls</span>
        </div>
        <DayEventsList
          selectedDate={selectedDate}
          selectedDateLabel={selectedDateLabel}
          items={selectedDayItems}
          onToggleTask={onToggleTask}
          onDeleteEvent={onDeleteEvent}
          onDeleteTask={onDeleteTask}
          onEditItem={onEditItem}
          onAddClick={onAddClick}
        />
      </div>
    </div>
  );
}
