import { GlassPanel } from "@/components/ui/glass-panel";
import { ThemeToolbarIcon } from "@/components/icons";
import { THEMES, type ThemeId } from "@/lib/theme-logic";
import { AiProvider } from "@/lib/ai/keys";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";

const PROVIDERS: { id: AiProvider; name: string }[] = [
  { id: "gemini", name: "Gemini" },
  { id: "openai", name: "OpenAI" },
  { id: "deepseek", name: "DeepSeek" },
  { id: "grok", name: "Grok (X.AI)" },
];

type Props = {
  t: (key: string) => string;
  locale: "lv" | "en";
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  onLocaleChange: (next: "lv" | "en") => void;
  byok: any;
  byokMeta: any;
  onByokChange: (provider: AiProvider, val: string) => void;
  onByokTest: (provider: AiProvider) => void;
  onByokDelete: () => void;
  settings: any;
  onToggleSetting: (key: string) => void;
  onSignOut: () => void;
};

export function DefaultSettingsLayout({
  t,
  locale,
  themeId,
  onThemeChange,
  onLocaleChange,
  byok,
  byokMeta,
  onByokChange,
  onByokTest,
  onByokDelete,
  settings,
  onToggleSetting,
  onSignOut,
}: Props) {
  return (
    <div className="space-y-10 pt-4 pb-12">
      {/* Themes */}
      <section className="space-y-4">
        <SectionHeading title={t("settings.theme.title")} />
        <GlassPanel className="p-4 sm:p-6">
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <button
                key={id}
                onClick={() => onThemeChange(id)}
                className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition-all ${
                  themeId === id ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <ThemeToolbarIcon themeId={id} size={32} tone={themeId === id ? "active" : "inactive"} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-text-secondary)">
                  {THEMES[id].name}
                </span>
              </button>
            ))}
          </div>
        </GlassPanel>
      </section>

      {/* Language */}
      <section className="space-y-4">
        <SectionHeading title={t("settings.lang.title")} />
        <div className="grid grid-cols-2 gap-3">
          {(["lv", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLocaleChange(l)}
              className={`flex h-14 items-center justify-center rounded-2xl border-2 font-bold transition-all ${
                locale === l ? 'border-primary bg-primary/5 text-primary' : 'border-(--color-border) text-(--color-text-secondary) hover:border-primary/30'
              }`}
            >
              {l === "lv" ? "Latviešu" : "English"}
            </button>
          ))}
        </div>
      </section>

      {/* AI BYOK */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading title={t("settings.byok.title")} />
          {byokMeta && <StatusPill tone="good" label="Aktīvs" />}
        </div>
        <GlassPanel className="space-y-6 p-6">
          {PROVIDERS.map((p) => (
            <div key={p.id} className="space-y-2">
              <label className="text-xs font-bold text-(--color-text-secondary)">{p.name} API atslēga</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={byok[p.id].value}
                  placeholder="****************"
                  onChange={(e) => onByokChange(p.id, e.target.value)}
                  className="flex-1 rounded-xl border border-(--color-border) bg-(--color-surface-2) px-4 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => onByokTest(p.id)}
                  disabled={byok[p.id].status === "testing" || !byok[p.id].value}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-30"
                >
                  {byok[p.id].status === "testing" ? "..." : "Testēt"}
                </button>
              </div>
            </div>
          ))}
          {byokMeta && (
            <button
              onClick={onByokDelete}
              className="w-full rounded-xl border border-red-200 py-3 text-xs font-bold text-red-500 transition hover:bg-red-50"
            >
              Dzēst konfigurāciju
            </button>
          )}
        </GlassPanel>
      </section>

      {/* System */}
      <section className="pt-4">
        <button
          onClick={onSignOut}
          className="w-full rounded-2xl bg-rose-50 py-4 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
        >
          {t("nav.signOut")}
        </button>
      </section>
    </div>
  );
}
