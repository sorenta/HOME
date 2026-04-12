import { GlassPanel } from "@/components/ui/glass-panel";
import { UpcomingEventCard } from "@/components/events/upcoming-event-card";
import { CalendarGrid } from "@/components/events/calendar-grid";
import { DayEventsList, type DayEntry } from "@/components/events/day-events-list";
import type { PlannerEvent, PlannerTask } from "@/lib/events-planner";

type Props = {
  upcomingDetails: any;
  locale: "lv" | "en";
  calendarMonth: Date;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDayItems: DayEntry[];
  indicatorsByDate: Record<string, number>;
  monthDays: any[];
  isoForDate: (date: Date) => string;
  onSelectDate: (iso: string) => void;
  onShiftMonth: (offset: number) => void;
  onGoToToday: () => void;
  onToggleTask: (taskId: string, done: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditItem: (item: DayEntry) => void;
  onAddClick: () => void;
  onOpenUpcoming: (eventId: string) => void;
  onEditUpcoming: (eventId: string) => void;
};

export function DefaultEventsLayout({
  upcomingDetails,
  locale,
  calendarMonth,
  selectedDate,
  selectedDateLabel,
  selectedDayItems,
  indicatorsByDate,
  monthDays,
  isoForDate,
  onSelectDate,
  onShiftMonth,
  onGoToToday,
  onToggleTask,
  onDeleteEvent,
  onDeleteTask,
  onEditItem,
  onAddClick,
  onOpenUpcoming,
  onEditUpcoming,
}: Props) {
  return (
    <div className="space-y-6">
      <GlassPanel className="space-y-4">
        <UpcomingEventCard
          event={upcomingDetails}
          onOpen={onOpenUpcoming}
          onEdit={onEditUpcoming}
          onCreate={onAddClick}
        />
      </GlassPanel>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel className="space-y-4">
          <CalendarGrid
            locale={locale}
            calendarMonth={calendarMonth}
            selectedDate={selectedDate}
            todayIso={isoForDate(new Date())}
            indicatorsByDate={indicatorsByDate}
            onSelectDate={onSelectDate}
            onShiftMonth={onShiftMonth}
            onGoToToday={onGoToToday}
            monthDays={monthDays}
          />
        </GlassPanel>

        <GlassPanel className="space-y-4">
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
        </GlassPanel>
      </div>
    </div>
  );
}
