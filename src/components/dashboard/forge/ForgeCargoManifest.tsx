"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchShoppingItems, type ShoppingRecord } from "@/lib/kitchen";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export function ForgeCargoManifest() {
  const { profile } = useAuth();
  const [items, setItems] = useState<ShoppingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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
  
  const pendingCount = items.filter(i => i.status === 'open').length;

  return (
    <section className="relative overflow-hidden rounded-sm border border-white/5 bg-black/20 backdrop-blur-xl">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3 text-left active:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-primary shadow-[0_0_5px_var(--color-primary)] rotate-45" />
          <div className="space-y-0.5">
            <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/80">Jāpiegādā paciņa</h2>
            <p className="text-[0.55rem] font-mono text-primary animate-pulse">
              {items.length > 0 
                ? (pendingCount > 0 ? `${pendingCount} PACIŅAS GAIDA` : "VISAS PIEGĀDES PABEIGTAS")
                : "JAUNU UZDEVUMU NAV"}
            </p>
          </div>
        </div>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-primary text-[0.6rem]"
        >
          {isOpen ? "▼" : "▲"}
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 font-mono text-[0.7rem] space-y-2">
              {items.length > 0 ? (
                items.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-l border-white/10 pl-3 py-1">
                    <span className={`font-bold shrink-0 ${item.status === 'picked' ? 'text-emerald-500' : 'text-primary'}`}>
                      {item.status === 'picked' ? '[GATAVS]' : '[GAIDA]'}
                    </span>
                    <span className="text-white/70 truncate uppercase tracking-tight">
                      {item.title}
                    </span>
                    <span className="ml-auto text-white/30 text-[0.6rem]">
                      {item.quantity} {item.unit || 'VIEN'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-white/30 italic py-2 text-center">Nav aktīvu vienību sarakstā</p>
              )}
              
              <Link 
                href="/kitchen" 
                className="block mt-4 text-center border border-white/10 py-2 hover:bg-white/5 transition-colors text-[0.6rem] font-black uppercase tracking-widest text-primary"
              >
                SKATĪT VISU SARAKSTU &gt;&gt;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
