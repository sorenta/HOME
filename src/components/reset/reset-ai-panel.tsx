"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { fetchHouseholdKitchenAiMeta } from "@/lib/household-kitchen-ai";

type Props = {
  mood?: string | null;
  moodScore?: number | null;
  signals?: Array<{ label: string; value: number }>;
  quitDays?: number | null;
  goals?: string[];
};

export function ResetAiPanel({ mood, moodScore, signals, quitDays, goals }: Props) {
  const { t, locale } = useI18n();
  const { session } = useAuth();
  const [canUseAi, setCanUseAi] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const syncKeyState = async () => {
      const meta = await fetchHouseholdKitchenAiMeta();
      if (!alive) return;
      setCanUseAi(Boolean(meta?.provider));
    };
    const onFocus = () => {
      void syncKeyState();
    };
    void syncKeyState();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function runAdvisor() {
    setError(null);
    setReply(null);
    setSuggestions([]);
    setEncouragement(null);
    const token = session?.access_token;
    if (!token) {
      setError(t("kitchen.ai.error.auth"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locale,
          prompt: prompt.trim() || undefined,
          mood,
          moodScore,
          signals,
          quitDays,
          goals,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        message?: string;
        reply?: string;
        suggestions?: string[];
        encouragement?: string;
      };

      if (!res.ok || !data.ok) {
        const code = data.code ?? "UNKNOWN";
        if (code === "SCHEMA_MISSING") setError(t("kitchen.ai.error.schema"));
        else if (code === "NO_USER_AI") setError(t("kitchen.ai.error.noKey"));
        else setError(data.message ?? t("kitchen.ai.error.generic"));
        return;
      }

      setReply(data.reply ?? "");
      setSuggestions(data.suggestions ?? []);
      setEncouragement(data.encouragement ?? null);
      hapticTap();
    } catch {
      setError(t("kitchen.ai.error.generic"));
    } finally {
      setLoading(false);
    }
  }

  if (!canUseAi) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-(--color-surface-border) bg-(--color-surface)/35 p-3 space-y-3">
      <p className="text-sm font-semibold text-(--color-text)">
        {t("reset.ai.title")}
      </p>
      <p className="text-xs text-(--color-secondary)">
        {t("reset.ai.hint")}
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        placeholder={t("reset.ai.placeholder")}
        className="w-full resize-none rounded-xl border border-(--color-surface-border) bg-transparent px-3 py-2 text-sm text-(--color-text)"
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => void runAdvisor()}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background disabled:opacity-50"
      >
        {loading ? t("kitchen.ai.thinking") : t("reset.ai.run")}
      </button>
      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      {reply ? (
        <div className="space-y-2 border-t border-(--color-surface-border) pt-3">
          <p className="text-sm leading-relaxed text-(--color-text)">{reply}</p>
          {suggestions.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-secondary)">
                {t("reset.ai.suggestions")}
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-(--color-text)">
                {suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {encouragement ? (
            <p className="mt-2 text-sm font-medium italic text-primary">
              {encouragement}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
