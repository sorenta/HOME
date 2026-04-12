"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchShoppingItems, type ShoppingRecord } from "@/lib/kitchen";
import { motion } from "framer-motion";
import Link from "next/link";
import hiveStyles from "@/components/theme/hive.module.css";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export function HiveCargoManifest() {
  const { profile } = useAuth();
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
      className={`relative overflow-hidden ${hiveStyles.hiveCard} p-6 bg-black/40 border border-primary/30 shadow-[0_4px_16px_rgba(251,191,36,0.05)]`}
      style={{ clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)" }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/20 border border-primary/30 text-primary" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
              <ShoppingCartIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-(--color-text-primary) tracking-tight">
                Krājumi
              </h2>
              <p className="text-xs font-medium text-(--color-text-secondary) mt-0.5 uppercase tracking-wider">
                {items.length > 0 
                  ? (pendingCount > 0 ? `${pendingCount} preces gaida` : "Viss iegādāts") 
                  : "Grozs ir tukšs"}
              </p>
            </div>
          </div>
          
          <Link 
            href="/kitchen" 
            className="rounded bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-all shadow-[0_0_10px_rgba(251,191,36,0.1)]"
          >
            Atvērt
          </Link>
        </div>

        {pendingCount > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {pendingItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-3 text-sm border-l-2 border-primary/50 pl-3 py-1">
                <span className="w-1.5 h-1.5 bg-primary opacity-80" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
                <span className="text-(--color-text-primary) truncate font-medium">{item.title}</span>
                {item.quantity && <span className="text-xs text-(--color-text-secondary) ml-auto font-mono">{item.quantity}</span>}
              </div>
            ))}
            {pendingCount > 3 && (
              <p className="text-xs text-(--color-text-secondary) italic mt-1 ml-4">
                un vēl {pendingCount - 3} preces...
              </p>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}