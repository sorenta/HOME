"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { getSuggestions, getCategoryByProductName, type KitchenCategory } from "@/lib/kitchen-data";

type Props = {
  onSave: (data: { name: string; quantity: number; expiryDate?: string; category: string }) => void;
  onCancel: () => void;
  locale: string;
};

export function KitchenItemForm({ onSave, onCancel, locale }: Props) {
  const { t } = useI18n();
  const { themeId } = useTheme();
  
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [manualCategory, setCategory] = useState<KitchenCategory | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => getSuggestions(name), [name]);

  const category = useMemo(() => {
    if (manualCategory) return manualCategory;
    if (name.length > 2) return getCategoryByProductName(name);
    return "other";
  }, [manualCategory, name]);

  const handleSelectSuggestion = (s: { name: string; category: KitchenCategory }) => {
    setName(s.name);
    setCategory(s.category);
    setShowSuggestions(false);
  };

  // Theme-specific styles (reusing logic from EventForm)
  const isForge = themeId === "forge";
  const isPulse = themeId === "pulse";
  const isLucent = themeId === "lucent";
  const isBotanical = themeId === "botanical";

  const modalBg = isForge 
    ? "bg-black/90 border-primary shadow-[0_0_60px_rgba(225,29,46,0.3)]" 
    : isLucent
      ? "bg-white/70 backdrop-blur-2xl border-white shadow-2xl"
      : isPulse
        ? "bg-white border-[4px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
        : isBotanical
          ? "bg-[#fdfcf0] border-[#4a5d23]/20 shadow-xl"
          : "bg-[#fffbeb] border-[#d97706]/20 shadow-xl";

  const textColor = isForge ? "text-white" : "text-[var(--color-foreground)]";
  const labelColor = isForge ? "text-primary" : "text-[var(--color-text-secondary)]";
  const inputBg = isForge ? "bg-white/5 border-white/10" : "bg-[var(--color-surface-2)] border-[var(--color-border)]";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute inset-0 ${isForge ? 'bg-black/90 backdrop-blur-md' : 'bg-black/40 backdrop-blur-sm'}`}
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`relative w-full max-w-md overflow-hidden p-6 ${modalBg}`}
        style={{
          borderRadius: isForge ? '2px' : isLucent ? '2.5rem' : isPulse ? '0' : isBotanical ? '2rem 1rem 2.5rem 1rem' : '1.5rem',
        }}
      >
        <div className={`mb-6 flex items-center justify-between border-b pb-3 ${isForge ? 'border-white/10' : 'border-current opacity-20'}`}>
          <div className="flex items-center gap-2">
            {!isPulse && <div className={`h-3 w-3 animate-pulse ${isForge ? 'bg-primary' : 'bg-[var(--color-accent)]'}`} />}
            <h2 className={`text-lg font-bold uppercase tracking-widest ${textColor} ${isForge ? 'font-(family-name:--font-rajdhani)' : ''}`}>
              {isForge ? "JAUNS_PRODUKTS" : (locale === "lv" ? "Pievienot produktu" : "Add Product")}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name Field with Suggestions */}
          <div className="relative space-y-1">
            <label className={`text-[0.6rem] font-black uppercase tracking-[0.2em] ${labelColor}`}>
              {locale === "lv" ? "Nosaukums" : "Product Name"}
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="..."
              className={`w-full px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} ${isForge ? 'font-mono' : ''} border rounded-sm`}
            />
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden border shadow-xl ${modalBg}`}
                  style={{ borderRadius: '0.5rem' }}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => handleSelectSuggestion(s)}
                      className={`w-full px-4 py-2 text-left text-xs hover:bg-primary/10 transition-colors ${textColor}`}
                    >
                      {s.name} <span className="opacity-40 italic">({t(`kitchen.category.${s.category}`)})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-1">
              <label className={`text-[0.6rem] font-black uppercase tracking-[0.2em] ${labelColor}`}>
                {locale === "lv" ? "Daudzums" : "Quantity"}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={`w-full px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} border rounded-sm`}
              />
            </div>
            {/* Category (Auto-selected) */}
            <div className="space-y-1">
              <label className={`text-[0.6rem] font-black uppercase tracking-[0.2em] ${labelColor}`}>
                {locale === "lv" ? "Kategorija" : "Category"}
              </label>
              <div className={`w-full px-4 py-3 text-xs opacity-80 ${inputBg} ${textColor} border rounded-sm truncate`}>
                {t(`kitchen.category.${category}`).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <label className={`text-[0.6rem] font-black uppercase tracking-[0.2em] ${labelColor}`}>
              {locale === "lv" ? "Derīguma termiņš (pēc izvēles)" : "Expiry Date (optional)"}
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={`w-full px-4 py-3 text-sm focus:outline-none transition-all ${inputBg} ${textColor} border rounded-sm [color-scheme:dark]`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className={`flex-1 py-3 text-[0.65rem] font-black uppercase tracking-widest transition-all ${isForge ? 'border border-white/10 text-white/40 hover:bg-white/5' : 'text-[var(--color-text-secondary)] hover:opacity-70'}`}
            >
              {isForge ? "[ PĀRTRAUKT ]" : t("nav.back")}
            </button>
            <button
              onClick={() => name && onSave({ name, quantity, expiryDate, category })}
              disabled={!name}
              className={`flex-1 py-3 text-[0.65rem] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-30 ${isForge ? 'bg-primary text-white shadow-[0_0_20px_rgba(225,29,46,0.4)] hover:bg-primary/80' : 'bg-[var(--color-button-primary)] text-[var(--color-button-primary-text)]'}`}
              style={{ borderRadius: isForge ? '2px' : '1.5rem' }}
            >
              {isForge ? "[ INICIĒT ]" : t("events.form.save")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
