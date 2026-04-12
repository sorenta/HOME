"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchShoppingItems, type ShoppingRecord } from "@/lib/kitchen";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";

export function LucentCargoManifest() {
  const { profile } = useAuth();
  const { t, locale } = useI18n();
  const [items, setItems] = useState<ShoppingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.household_id) return;
    let alive = true;

    const loadData = async () => {
      const hid = profile?.household_id;
      if (!hid) return;
      
      const data = await fetchShoppingItems(hid);
      if (alive) {
        setItems(data);
        setLoading(false);
      }
    };

    loadData();
    return () => { alive = false; };
  }, [profile?.household_id]);

  if (loading && items.length === 0) return null;
  
  const pendingItems = items.filter(i => i.status === 'open');
  const pendingCount = pendingItems.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-[40px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#FAF8F5] dark:bg-white/5 shadow-sm border border-white/80 dark:border-white/5">
              <span className="text-xl opacity-70 drop-shadow-sm">🛒</span>
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground tracking-tight">
                Iepirkumu groziņš
              </h2>
              <p className="text-xs font-medium text-foreground/70 mt-0.5">
                {items.length > 0 
                  ? (pendingCount > 0 ? `${pendingCount} preces sarakstā` : "Viss iegādāts") 
                  : "Saraksts ir tukšs"}
              </p>
            </div>
          </div>
          
          <Link 
            href="/kitchen" 
            className="rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-white/80 dark:border-white/5 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            Atvērt
          </Link>
        </div>

        {pendingCount > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {pendingItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-3 text-sm border-l-2 border-orange-300 dark:border-orange-500/50 pl-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-50" />
                <span className="text-foreground/80 truncate">{item.title}</span>
                {item.quantity && <span className="text-xs text-foreground/60 ml-auto">{item.quantity}</span>}
              </div>
            ))}
            {pendingCount > 3 && (
              <p className="text-xs text-foreground/60 italic mt-1 ml-4">
                un vēl {pendingCount - 3} preces...
              </p>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}