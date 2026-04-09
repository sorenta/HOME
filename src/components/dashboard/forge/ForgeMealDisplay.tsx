"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n-context";
import Link from "next/link";

type MealEvent = {
  id: string;
  title: string;
};

export function ForgeMealDisplay() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const [meal, setMeal] = useState<MealEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.household_id) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    const fetchTodayMeal = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id, title")
        .eq("household_id", profile.household_id)
        .eq("kind", "meal")
        .eq("starts_on", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setMeal(data);
      }
      setLoading(false);
    };

    fetchTodayMeal();
  }, [profile?.household_id]);

  if (loading || !meal) return null;

  // Truncate long meal titles and strip prefix
  const rawTitle = meal.title.startsWith("Vakariņas: ") 
    ? meal.title.substring("Vakariņas: ".length) 
    : meal.title;

  const displayTitle = rawTitle.length > 40 
    ? rawTitle.substring(0, 37) + "..." 
    : rawTitle;

  return (
    <Link 
      href="/kitchen"
      className="group relative flex items-center gap-3 rounded-sm border border-primary/10 bg-primary/5 p-2 transition-all hover:bg-primary/10 active:scale-[0.98]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-sm">
        🥘
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.5rem] font-black uppercase tracking-widest text-primary/50">
          {locale === "lv" ? "DIENAS RECEPTES" : "DAILY LOGISTICS: MEALS"}
        </p>
        <h2 className="text-[0.7rem] font-bold uppercase tracking-tight text-white/90 truncate">
          {displayTitle}
        </h2>
      </div>
      <div className="h-full w-1 bg-primary/30 group-hover:bg-primary transition-colors" />
    </Link>
  );
}
