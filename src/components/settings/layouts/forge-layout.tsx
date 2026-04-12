import { GlassPanel } from "@/components/ui/glass-panel";
import { ThemeToolbarIcon } from "@/components/icons";
import { THEMES, type ThemeId } from "@/lib/theme-logic";
import { AiProvider } from "@/lib/ai/keys";

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

export function ForgeSettingsLayout({
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
      {/* SECTOR 01: VISUAL_INTERFACE */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Vizuālais interfeiss</span>
        </div>
        
        <GlassPanel className="p-6 bg-black/40 border-white/5 rounded-sm">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-primary mb-4">THEME_SELECTION_MATRIX</p>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <button
                key={id}
                onClick={() => onThemeChange(id)}
                className={`flex flex-col items-center gap-2 p-3 transition-all border ${
                  themeId === id ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                <ThemeToolbarIcon themeId={id} size={24} tone={themeId === id ? "active" : "inactive"} />
                <span className="text-[0.5rem] font-black uppercase tracking-tighter">{THEMES[id].name}</span>
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* SECTOR 02: CORE_LOCALIZATION */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Kodola lokalizācija</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["lv", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLocaleChange(l)}
              className={`p-4 border font-mono text-[0.6rem] font-black uppercase tracking-widest transition-all ${
                locale === l ? 'bg-primary text-white border-primary' : 'bg-black/20 border-white/5 text-white/40 hover:bg-white/5'
              }`}
            >
              {l === "lv" ? "LATVIEŠU [LV]" : "ENGLISH [EN]"}
            </button>
          ))}
        </div>
      </div>

      {/* SECTOR 03: INTELLIGENCE_BYOK */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Intelekta konfigurācija</span>
        </div>
        <GlassPanel className="p-6 bg-black/40 border-white/5 rounded-sm space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-primary">BYOK_VAULT_STATUS</p>
            <div className={`flex items-center gap-2 px-2 py-1 rounded-sm border ${byokMeta ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-white/40'}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${byokMeta ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
              <span className="text-[0.5rem] font-black uppercase">{byokMeta ? 'CONNECTED' : 'DISCONNECTED'}</span>
            </div>
          </div>

          <div className="space-y-4">
            {PROVIDERS.map((p) => (
              <div key={p.id} className="space-y-2">
                <label className="text-[0.5rem] font-black uppercase tracking-widest text-white/40">{p.name} API_KEY</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={byok[p.id].value}
                    placeholder="****************"
                    onChange={(e) => onByokChange(p.id, e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                  />
                  <button
                    onClick={() => onByokTest(p.id)}
                    disabled={byok[p.id].status === "testing" || !byok[p.id].value}
                    className="px-4 py-2 border border-primary/30 text-[0.5rem] font-black uppercase tracking-widest text-primary hover:bg-primary/10 disabled:opacity-30"
                  >
                    {byok[p.id].status === "testing" ? "..." : "[ TEST ]"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {byokMeta && (
            <button
              onClick={onByokDelete}
              className="w-full py-2 border border-red-500/30 text-[0.5rem] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10"
            >
              [ DZĒST_KONFIGURĀCIJU ]
            </button>
          )}
        </GlassPanel>
      </div>

      {/* SECTOR 04: SYSTEM_OPERATIONS */}
      <div className="space-y-3 pb-12">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 04</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Sistēmas operācijas</span>
        </div>
        <button
          onClick={onSignOut}
          className="w-full p-4 border border-white/5 bg-white/5 text-white/40 text-[0.6rem] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          [ TERMINATE_SESSION ]
        </button>
      </div>
    </div>
  );
}
