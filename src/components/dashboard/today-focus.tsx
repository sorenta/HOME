"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { fetchFixedCosts, fetchFinanceTransactions, fixedCostPaidThisMonth } from "@/lib/finance";
import { fetchKitchenInventory } from "@/lib/kitchen";
import { fetchPharmacyInventory } from "@/lib/pharmacy";
import { loadPlannerStateSynced } from "@/lib/events-sync";
import { AppSectionIcon, type AppSectionId } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { hapticTap } from "@/lib/haptic";
import Link from "next/link";

type FocusItem = {
  id: string;
  label: string;
  sectionId: AppSectionId;
  priority: "high" | "medium" | "low";
  href: string;
};

export function TodayFocus() {
  const { profile, user } = useAuth();
  const { t } = useI18n();
  const { themeId } = useTheme();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FocusItem[]>([]);

  const householdId = profile?.household_id;

  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    let alive = true;

    async function fetchData() {
      try {
        const [costs, txs, kitchen, pharmacy, planner] = await Promise.all([
          fetchFixedCosts(householdId!),
          fetchFinanceTransactions(householdId!),
          fetchKitchenInventory(householdId!),
          fetchPharmacyInventory(householdId!),
          loadPlannerStateSynced({
            householdId: householdId!,
            userId: user?.id ?? null,
            memberNameById: {},
            fallbackMemberName: "..."
          })
        ]);

        if (!alive) return;

        const newItems: FocusItem[] = [];

        // 1. Unpaid bills (Due this month)
        const unpaidCount = costs.filter(c => !fixedCostPaidThisMonth(c.id, txs)).length;
        if (unpaidCount > 0) {
          newItems.push({
            id: "bills",
            label: t("dashboard.focus.unpaidBills").replace("{count}", String(unpaidCount)),
            sectionId: "finance",
            priority: "high",
            href: "/finance"
          });
        }

        // 2. Expiring food
        const expiringFood = kitchen.filter(i => i.status === "expiring" || i.status === "expired").length;
        if (expiringFood > 0) {
          newItems.push({
            id: "kitchen",
            label: t("dashboard.focus.expiringItems").replace("{count}", String(expiringFood)),
            sectionId: "kitchen",
            priority: "medium",
            href: "/kitchen"
          });
        }

        // 3. Expiring medicine
        const expiringMeds = pharmacy.filter(i => i.status === "critical" || i.status === "warning").length;
        if (expiringMeds > 0) {
          newItems.push({
            id: "pharmacy",
            label: t("dashboard.focus.expiringItems").replace("{count}", String(expiringMeds)),
            sectionId: "pharmacy",
            priority: "high",
            href: "/pharmacy"
          });
        }

        // 4. Upcoming events (today) - Excluding personal "secret" events
        const today = new Date().toISOString().split("T")[0];
        const todayEvents = planner.events.filter(e => e.date === today && e.kind !== "personal").length;
        if (todayEvents > 0) {
          newItems.push({
            id: "events",
            label: t("dashboard.focus.upcomingEvents").replace("{count}", String(todayEvents)),
            sectionId: "calendar",
            priority: "medium",
            href: "/calendar"
          });
        }

        setItems(newItems.sort((a, b) => {
          const pMap = { high: 0, medium: 1, low: 2 };
          return pMap[a.priority] - pMap[b.priority];
        }));
      } catch (e) {
        console.error("Focus fetch failed", e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchData();
    return () => { alive = false; };
  }, [householdId, user?.id, t]);

  if (loading || (!householdId && !loading)) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="maj-focus-container w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-(--color-text-secondary) opacity-70">
          {t("dashboard.focus.title")}
        </h3>
        {items.length === 0 && (
          <span className="text-[0.65rem] font-medium text-emerald-500 animate-pulse">
             ● {t("dashboard.focus.allClear")}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {items.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-2"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Link
                  href={item.href}
                  onClick={() => hapticTap()}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) p-3 transition-all active:scale-[0.98] hover:border-(--color-primary-soft)"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-surface-border) transition-colors group-hover:bg-(--color-primary-soft)`}>
                    <AppSectionIcon sectionId={item.sectionId} themeId={themeId} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold tracking-tight text-(--color-text-primary)">
                      {item.label}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <div className={`h-2 w-2 rounded-full ${item.priority === 'high' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="rounded-(--radius-card) border border-dashed border-(--color-surface-border) p-4 text-center"
          >
            <p className="text-xs text-(--color-text-secondary)">
              {t("dashboard.focus.allClear")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
