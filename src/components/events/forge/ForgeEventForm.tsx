"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { type HouseholdMember } from "@/lib/household";

type Props = {
  kind: string;
  onSave: (title: string, note: string, date?: string, time?: string, isRecurring?: boolean, assigneeId?: string) => void;
  onCancel: () => void;
  locale: string;
  members?: HouseholdMember[];
};

export function ForgeEventForm({ kind, onSave, onCancel, locale, members = [] }: Props) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(kind === "birthday" || kind === "nameday");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || "");

  const kindLabels: Record<string, string> = {
    reminder: t("events.type.reminder").toUpperCase(),
    birthday: t("events.type.birthday").toUpperCase(),
    nameday: t("events.type.nameday").toUpperCase(),
    homework: t("events.type.homework").toUpperCase(),
    personal: t("events.type.personal").toUpperCase(),
    shared: t("events.type.shared").toUpperCase(),
  };

  const isBirthdayOrNameday = kind === "birthday" || kind === "nameday";
  const isTask = kind === "homework";

  const placeholder = isBirthdayOrNameday 
    ? t("events.field.person")
    : (locale === "lv" ? "Ierakstiet nosaukumu..." : "Enter title...");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md overflow-hidden rounded-sm border border-primary bg-black p-6 shadow-[0_0_60px_rgba(225,29,46,0.3)]"
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-primary animate-pulse" />
            <h2 className="font-(family-name:--font-rajdhani) text-lg font-bold uppercase tracking-widest text-white">
              Konfigurēt: {kindLabels[kind] || kind.toUpperCase()}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-primary">
              {isBirthdayOrNameday ? t("events.field.person") : isTask ? t("events.todo.form.title") : "Identifikators (Nosaukums)"}
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-primary focus:bg-primary/5 transition-all"
            />
          </div>

          {isTask && members.length > 0 && (
            <div className="space-y-1">
              <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/40">{t("events.todo.form.assignee")}</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-black text-white">
                    {m.display_name || t("events.todo.unassigned")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className={`space-y-1 ${kind === "birthday" ? "col-span-2" : ""}`}>
              <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/40">Datums</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
              />
            </div>
            {kind !== "birthday" && (
              <div className="space-y-1">
                <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/40">{t("events.field.time")}</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/40">
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
              className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.02] transition-all"
            />
          </div>

          {isBirthdayOrNameday && (
            <div className="flex items-center justify-between rounded-sm border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-white/60">
                  {locale === "lv" ? "Atkārtot katru gadu" : "Repeat yearly"}
                </p>
                <p className="text-[0.5rem] font-mono text-white/20 uppercase tracking-tighter">
                  {isRecurring ? "STATUS: RECURRENCE_ANNUAL_ACTIVE" : "STATUS: SINGLE_EXECUTION"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`h-5 w-10 rounded-full transition-all relative ${isRecurring ? "bg-primary" : "bg-white/10"}`}
              >
                <motion.div
                  animate={{ x: isRecurring ? 20 : 4 }}
                  className="absolute top-1 h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </button>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 border border-white/10 py-3 rounded-sm text-[0.65rem] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all"
            >
              [ PĀRTRAUKT ]
            </button>
            <button
              onClick={() => title && onSave(title, note, date, time, isRecurring, assigneeId)}
              disabled={!title || (kind === "reminder" && !time)}
              className="flex-1 bg-primary py-3 rounded-sm text-[0.65rem] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(225,29,46,0.4)] hover:bg-primary/80 disabled:opacity-30 disabled:shadow-none transition-all"
            >
              [ INICIĒT ]
            </button>
          </div>
        </div>

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
      </motion.div>
    </div>
  );
}
