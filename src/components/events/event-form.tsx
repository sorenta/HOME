"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { type HouseholdMember } from "@/lib/household";

type Props = {
  kind: string;
  onSave: (title: string, note: string, date?: string, time?: string, isRecurring?: boolean, assigneeId?: string) => void;
  onCancel: () => void;
  locale: string;
  members?: HouseholdMember[];
  initialData?: {
    title: string;
    note?: string;
    date?: string;
    time?: string;
    isRecurring?: boolean;
    assigneeId?: string;
  };
};

export function EventForm({ kind, onSave, onCancel, locale, members = [], initialData }: Props) {
  const { t } = useI18n();
  const { themeId } = useTheme();
  const [title, setTitle] = useState(initialData?.title || "");
  const [note, setNote] = useState(initialData?.note || "");
  const [date, setDate] = useState(() => initialData?.date || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(initialData?.time || "");
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? (kind === "birthday" || kind === "nameday"));
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || members[0]?.id || "");

  const kindLabels: Record<string, string> = {
    reminder: t("events.type.reminder"),
    birthday: t("events.type.birthday"),
    nameday: t("events.type.nameday"),
    homework: t("events.type.homework"),
    personal: t("events.type.personal"),
    shared: t("events.type.shared"),
  };

  const isBirthdayOrNameday = kind === "birthday" || kind === "nameday";
  const isTask = kind === "homework";

  const placeholder = isBirthdayOrNameday 
    ? t("events.field.person")
    : (locale === "lv" ? "Ierakstiet nosaukumu..." : "Enter title...");

  // Theme-specific styles
  const isForge = themeId === "forge";
  const isPulse = themeId === "pulse";
  const isLucent = themeId === "lucent";
  const isBotanical = themeId === "botanical";
  const isHive = themeId === "hive";

  const modalBg = isForge 
    ? "bg-black/90 border-primary shadow-[0_0_60px_rgba(225,29,46,0.3)]" 
    : isLucent
      ? "bg-gradient-to-br from-white to-[#FAF8F5] dark:from-zinc-900 dark:to-zinc-950 border-[#F3F0EA] dark:border-zinc-800/80 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border"
      : isPulse
        ? "bg-white border-[4px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
        : isBotanical
          ? "bg-[#fdfcf0] border-[#4a5d23]/20 shadow-xl"
          : "bg-[#fffbeb] border-[#d97706]/20 shadow-xl";

  const textColor = isForge ? "text-white" : isLucent ? "text-foreground/90" : "text-[var(--color-foreground)]";
  const labelColor = isForge ? "text-primary" : isLucent ? "text-foreground/90" : "text-[var(--color-text-secondary)]";
  const inputBg = isForge ? "bg-white/5 border-white/10" : isLucent ? "bg-white/60 dark:bg-black/10 border-black/5 dark:border-white/5 shadow-inner" : "bg-[var(--color-surface-2)] border-[var(--color-border)]";
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className={`absolute inset-0 ${isForge ? 'bg-black/90 backdrop-blur-md' : 'bg-black/40 backdrop-blur-sm'}`}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`relative w-full max-w-md overflow-hidden p-6 ${modalBg}`}
        style={{
          borderRadius: isForge ? '2px' : isLucent ? '2.5rem' : isPulse ? '0' : isBotanical ? '2rem 1rem 2.5rem 1rem' : '1.5rem',
          clipPath: isHive ? "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)" : undefined
        }}
      >
        {/* Header */}
        <div className={`mb-6 flex items-center justify-between border-b pb-3 ${isForge ? 'border-white/10' : 'border-current opacity-20'}`}>
          <div className="flex items-center gap-2">
            {!isPulse && <div className={`h-3 w-3 animate-pulse ${isForge ? 'bg-primary' : 'bg-[var(--color-accent)]'}`} style={{ borderRadius: isBotanical ? '50% 20%' : '50%' }} />}
            <h2 className={`text-lg font-bold uppercase tracking-widest ${textColor} ${isForge ? 'font-(family-name:--font-rajdhani)' : ''}`}>
              {isForge && "Konfigurēt: "}{kindLabels[kind] || kind.toUpperCase()}
            </h2>
          </div>
          {!isForge && (
            <button onClick={onCancel} className="text-current opacity-40 hover:opacity-100 transition-opacity">✕</button>
          )}
        </div>

        <div className="space-y-4">
          {/* Title Field */}
          <div className="space-y-1">
            <label className={`text-[0.65rem] font-bold uppercase ${isLucent ? 'tracking-[0.1em]' : 'tracking-[0.2em] font-black'} ${labelColor}`}>
              {isBirthdayOrNameday ? t("events.field.person") : isTask ? t("events.todo.form.title") : (isForge ? "Identifikators (Nosaukums)" : t("events.form.title"))}
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={placeholder}
              className={`w-full rounded-sm px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} ${isForge ? 'font-mono focus:border-primary focus:bg-primary/5' : 'focus:ring-2 focus:ring-[var(--color-accent-soft)]'} ${isPulse ? 'border-2 border-black' : 'border'}`}
              style={{ borderRadius: isLucent ? '1.5rem' : isBotanical ? '1rem' : undefined }}
            />
          </div>

          {/* Assignee Field (Tasks only) */}
          {isTask && members.length > 0 && (
            <div className="space-y-1">
              <label className={`text-[0.65rem] font-bold uppercase ${isLucent ? 'tracking-[0.1em]' : 'tracking-[0.2em] font-black'} ${isForge ? 'text-white/40' : labelColor}`}>
                {t("events.todo.form.assignee")}
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={`w-full rounded-sm px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} ${isForge ? 'font-mono [color-scheme:dark]' : ''} ${isPulse ? 'border-2 border-black' : 'border'}`}
                style={{ borderRadius: isLucent ? '1.5rem' : isBotanical ? '1rem' : undefined }}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className={isForge ? "bg-black text-white" : "bg-white text-black"}>
                    {m.display_name || t("events.todo.unassigned")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date and Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`space-y-1 ${isBirthdayOrNameday ? "col-span-2" : ""}`}>
              <label className={`text-[0.65rem] font-bold uppercase ${isLucent ? 'tracking-[0.1em]' : 'tracking-[0.2em] font-black'} ${isForge ? 'text-white/40' : labelColor}`}>
                {t("events.form.date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-sm px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} ${isForge ? 'font-mono [color-scheme:dark]' : ''} ${isPulse ? 'border-2 border-black' : 'border'}`}
                style={{ borderRadius: isLucent ? '1.2rem' : isBotanical ? '0.8rem' : undefined }}
              />
            </div>
            {!isBirthdayOrNameday && (
              <div className="space-y-1">
                <label className={`text-[0.65rem] font-bold uppercase ${isLucent ? 'tracking-[0.1em]' : 'tracking-[0.2em] font-black'} ${isForge ? 'text-white/40' : labelColor}`}>
                  {t("events.field.time")}
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full rounded-sm px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} ${isForge ? 'font-mono [color-scheme:dark]' : ''} ${isPulse ? 'border-2 border-black' : 'border'}`}
                  style={{ borderRadius: isLucent ? '1.2rem' : isBotanical ? '0.8rem' : undefined }}
                />
              </div>
            )}
          </div>

          {/* Notes Field */}
          <div className="space-y-1">
            <label className={`text-[0.65rem] font-bold uppercase ${isLucent ? 'tracking-[0.1em]' : 'tracking-[0.2em] font-black'} ${isForge ? 'text-white/40' : labelColor}`}>
              {kind === "birthday" 
                ? t("events.field.notes.birthday") 
                : kind === "nameday" 
                  ? t("events.field.notes.nameday") 
                  : kind === "homework"
                    ? t("events.field.notes.homework")
                    : kind === "personal"
                      ? t("events.field.notes.personal")
                      : kind === "shared"
                        ? t("events.field.notes.shared")
                        : t("events.field.notes")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="..."
              rows={2}
              className={`w-full rounded-sm px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} ${isForge ? 'font-mono focus:border-white/30 focus:bg-white/[0.02]' : 'focus:ring-2 focus:ring-[var(--color-accent-soft)]'} ${isPulse ? 'border-2 border-black' : 'border'}`}
              style={{ borderRadius: isLucent ? '1.5rem' : isBotanical ? '1rem' : undefined }}
            />
          </div>

          {/* Recurring Toggle (Birthdays/Namedays) */}
          {isBirthdayOrNameday && (
            <div className={`flex items-center justify-between rounded-sm px-4 py-3 ${isForge ? 'border border-white/5 bg-white/[0.02]' : 'bg-[var(--color-surface-2)]'}`}
                 style={{ borderRadius: isLucent ? '1.5rem' : isBotanical ? '1rem' : undefined }}>
              <div className="space-y-0.5">
                <p className={`text-[0.65rem] font-bold uppercase ${isLucent ? 'tracking-[0.1em]' : 'tracking-widest font-black'} ${isForge ? 'text-white/60' : labelColor}`}>
                  {locale === "lv" ? "Atkārtot katru gadu" : "Repeat yearly"}
                </p>
                {isForge && (
                  <p className="text-[0.5rem] font-mono text-white/20 uppercase tracking-tighter">
                    {isRecurring ? "STATUS: RECURRENCE_ANNUAL_ACTIVE" : "STATUS: SINGLE_EXECUTION"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`h-5 w-10 rounded-full transition-all relative ${isRecurring ? (isForge ? 'bg-primary' : 'bg-[var(--color-accent)]') : 'bg-current opacity-20'}`}
              >
                <motion.div
                  animate={{ x: isRecurring ? 20 : 4 }}
                  className={`absolute top-1 h-3 w-3 rounded-full bg-white ${isForge ? 'shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}
                />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className={`flex-1 py-3 text-[0.65rem] font-black uppercase tracking-widest transition-all ${isForge ? 'border border-white/10 text-white/40 hover:bg-white/5 rounded-sm' : 'text-[var(--color-text-secondary)] hover:opacity-70'} ${isPulse ? 'border-2 border-black rounded-none' : ''}`}
            >
              {isForge ? "[ PĀRTRAUKT ]" : t("nav.back")}
            </button>
            <button
              onClick={() => title && onSave(title, note, date, time, isRecurring, assigneeId)}
              disabled={!title || (kind === "reminder" && !time)}
              className={`flex-1 py-3 text-[0.65rem] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-30 disabled:shadow-none ${isForge ? 'bg-primary text-white rounded-sm shadow-[0_0_20px_rgba(225,29,46,0.4)] hover:bg-primary/80' : 'bg-[var(--color-button-primary)] text-[var(--color-button-primary-text)] hover:scale-[1.02]'} ${isPulse ? 'border-2 border-black rounded-none shadow-[4px_4px_0px_black]' : ''}`}
              style={{ 
                borderRadius: isLucent ? '1.5rem' : isBotanical ? '1rem' : isForge ? '2px' : undefined,
                boxShadow: isLucent ? '0 8px 24px var(--color-accent-soft)' : undefined
              }}
            >
              {isForge ? "[ INICIĒT ]" : t("events.form.save")}
            </button>
          </div>
        </div>

        {/* Decorative Footer (Forge Only) */}
        {isForge && (
          <div className="mt-6 flex justify-between items-center opacity-20">
            <span className="text-[0.5rem] font-mono tracking-tighter uppercase">
              {kind === "reminder" 
                ? (locale === "lv" ? "PAZIŅOJUMA_DATI_SAGATAVOTI" : "NOTIFICATION_PAYLOAD_READY")
                : (locale === "lv" ? "KALENDĀRA_SINHRONIZĀCIJA_GATAVA" : "CALENDAR_SYNC_READY")}
            </span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white rounded-full" />
              <div className="w-1 h-1 bg-white rounded-full" />
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
