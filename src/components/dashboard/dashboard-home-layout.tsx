"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ThemeId } from "@/lib/theme-logic";
import { useDashboardPrefs } from "@/lib/dashboard-prefs";

import { ForgeHero } from "@/components/dashboard/forge/ForgeHero";
import { LucentHero } from "@/components/dashboard/lucent/LucentHero";
import { ForgeSatelliteComms } from "@/components/dashboard/forge/ForgeSatelliteComms";
import { LucentCalendarCard } from "@/components/dashboard/lucent/LucentCalendarCard";
import { ForgeResourceMonitor } from "@/components/dashboard/forge/ForgeResourceMonitor";
import { ForgeAlertLog } from "@/components/dashboard/forge/ForgeAlertLog";
import { LucentAlertLog } from "@/components/dashboard/lucent/LucentAlertLog";
import { ForgeCargoManifest } from "@/components/dashboard/forge/ForgeCargoManifest";
import { LucentCargoManifest } from "@/components/dashboard/lucent/LucentCargoManifest";
import { HiveHero } from "@/components/dashboard/hive/HiveHero";
import { HiveCalendarCard } from "@/components/dashboard/hive/HiveCalendarCard";
import { HiveCargoManifest } from "@/components/dashboard/hive/HiveCargoManifest";
import { HiveAlertLog } from "@/components/dashboard/hive/HiveAlertLog";

import { BotanicalHero } from "@/components/dashboard/botanical/BotanicalHero";
import { BotanicalCalendarCard } from "@/components/dashboard/botanical/BotanicalCalendarCard";
import { BotanicalCargoManifest } from "@/components/dashboard/botanical/BotanicalCargoManifest";
import { BotanicalAlertLog } from "@/components/dashboard/botanical/BotanicalAlertLog";

export type DashboardHomeSlots = {
  header?: ReactNode;
  notice?: ReactNode;
  focus?: ReactNode;
  householdSummary?: ReactNode;
  water?: ReactNode;
  metrics?: ReactNode;
  householdPanel?: ReactNode;
  modules?: ReactNode;
  feed?: ReactNode;
  cart?: ReactNode;
  reminders?: ReactNode;
};

type Props = {
  themeId: ThemeId;
  slots?: DashboardHomeSlots;
};

export function DashboardHomeLayout({ themeId, slots = {} }: Props) {
  const { feed = null } = slots;
  const isOrganicTheme = themeId === "lucent" || themeId === "hive" || themeId === "botanical";
  const { prefs, updatePrefs, mounted } = useDashboardPrefs();
  const [isEditing, setIsEditing] = useState(false);

  if (!mounted) return <div className="h-screen bg-transparent" />; // Wait for prefs to load

  const CustomizationModal = () => (
    <AnimatePresence>
      {isEditing && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative w-full max-w-sm overflow-hidden p-6 shadow-2xl ${
              themeId === "forge"
                ? 'bg-black border border-primary/40 rounded-sm'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem]'
            }`}
          >
            <div className={`mb-6 border-b pb-3 ${themeId === "forge" ? 'border-primary/20' : 'border-current opacity-20'}`}>
              <h2 className={`text-lg uppercase tracking-widest ${themeId === "forge" ? 'text-primary font-black' : 'font-bold'}`}>
                Pielāgot sākuma ekrānu
              </h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-semibold uppercase tracking-wider ${themeId === "forge" ? "text-white/60" : "text-foreground"}`}>Kalendārs un Plānošana</span>
                <input type="checkbox" checked={prefs.showCalendar} onChange={(e) => updatePrefs({ showCalendar: e.target.checked })} className="w-5 h-5 accent-primary" />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-semibold uppercase tracking-wider ${themeId === "forge" ? "text-white/60" : "text-foreground"}`}>Ūdens patēriņš (Biometrija)</span>
                <input type="checkbox" checked={prefs.showWater} onChange={(e) => updatePrefs({ showWater: e.target.checked })} className="w-5 h-5 accent-primary" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-semibold uppercase tracking-wider ${themeId === "forge" ? "text-white/60" : "text-foreground"}`}>Loģistika un Notikumi</span>
                <input type="checkbox" checked={prefs.showLogistics} onChange={(e) => updatePrefs({ showLogistics: e.target.checked })} className="w-5 h-5 accent-primary" />
              </label>
            </div>

            <button
              onClick={() => setIsEditing(false)}
              className={`mt-8 w-full py-3 text-xs font-black uppercase tracking-widest transition-all ${
                themeId === "forge" ? 'bg-primary/20 border border-primary text-primary hover:bg-primary/30 rounded-sm' : 'bg-primary text-primary-foreground hover:opacity-90 rounded-xl'
              }`}
            >
              [ Saglabāt un Aizvērt ]
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative maj-dash-compose maj-dash-compose--${themeId} ${isOrganicTheme ? "space-y-4 pt-24 pb-28 px-4" : "space-y-10 pt-20 pb-12 px-4"}`}>
      <CustomizationModal />

      {/* SECTOR 01: COMMAND & CONTROL */}
      <div className={isOrganicTheme ? "space-y-4" : "space-y-3"}>
        {!isOrganicTheme && (
          <div className="flex items-center gap-3 px-1 opacity-40">
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Vadība un kontrole</span>
          </div>
        )}
        <div className={isOrganicTheme ? "flex flex-col gap-4" : "space-y-4"}>
          {themeId === "lucent" ? <LucentHero /> : themeId === "botanical" ? <BotanicalHero /> : themeId === "hive" ? <HiveHero /> : <ForgeHero />}
          
          {prefs.showCalendar && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              {themeId === "lucent" ? <LucentCalendarCard /> : themeId === "botanical" ? <BotanicalCalendarCard /> : themeId === "hive" ? <HiveCalendarCard /> : <ForgeSatelliteComms />}
            </motion.div>
          )}
        </div>
      </div>

      {/* SECTOR 02: BIOMETRICS */}
      <AnimatePresence>
        {prefs.showWater && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={isOrganicTheme ? "space-y-4" : "space-y-3"}>
            {!isOrganicTheme && (
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Biometrija un resursi</span>
              </div>
            )}
            {isOrganicTheme && slots.water ? slots.water : <ForgeResourceMonitor />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTOR 03: LOGISTICS & DATA */}
      <AnimatePresence>
        {prefs.showLogistics && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={isOrganicTheme ? "space-y-4" : "space-y-3"}>
            {!isOrganicTheme && (
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Loģistika un operatīvie dati</span>
              </div>
            )}
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
              {themeId === "lucent" ? <LucentCargoManifest /> : themeId === "botanical" ? <BotanicalCargoManifest /> : themeId === "hive" ? <HiveCargoManifest /> : <ForgeCargoManifest />}
              {themeId === "lucent" ? <LucentAlertLog /> : themeId === "botanical" ? <BotanicalAlertLog /> : themeId === "hive" ? <HiveAlertLog /> : <ForgeAlertLog />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional Feed (Module activity) */}
      {feed ? <div className="mt-8">{feed}</div> : null}

      <div className="flex justify-center pt-8 pb-4">
        <button
          onClick={() => setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
            themeId === "forge" ? 'text-primary/60 hover:text-primary' : 'text-[var(--color-text-secondary)] hover:text-primary'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
          Pielāgot ekrānu
        </button>
      </div>
    </div>
  );
}
