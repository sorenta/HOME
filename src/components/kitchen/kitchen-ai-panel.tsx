"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  fetchHouseholdKitchenAiMeta,
  upsertHouseholdKitchenAi,
  deleteHouseholdKitchenAi,
} from "@/lib/household-kitchen-ai";
import {
  getGeminiKeyFromStorage,
  getOpenAIKeyFromStorage,
  validateProviderKey,
  type AiProvider,
} from "@/lib/ai/keys";
import { addShoppingItem, type KitchenInventoryRecord, type ShoppingRecord } from "@/lib/kitchen";
import { hapticTap } from "@/lib/haptic";

type Props = {
  householdId: string;
  inventory: KitchenInventoryRecord[];
  shopping: ShoppingRecord[];
  onReload: () => Promise<void>;
  onMissingListChange: (items: string[]) => void;
};

export function KitchenAiPanel({
  householdId,
  inventory,
  shopping,
  onReload,
  onMissingListChange,
}: Props) {
  const { t, locale } = useI18n();
  const { user, session } = useAuth();
  const [meta, setMeta] = useState<Awaited<ReturnType<typeof fetchHouseholdKitchenAiMeta>>>(null);
  const [provider, setProvider] = useState<AiProvider>("openai");
  const [keyDraft, setKeyDraft] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [keyMessage, setKeyMessage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [mealIdeas, setMealIdeas] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadMeta = useCallback(async () => {
    const row = await fetchHouseholdKitchenAiMeta(householdId);
    setMeta(row);
    if (row?.provider) setProvider(row.provider);
  }, [householdId]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    onMissingListChange(missing);
  }, [missing, onMissingListChange]);

  async function saveHouseholdKey() {
    setKeyMessage(null);
    if (!user?.id) return;
    const err = validateProviderKey(provider, keyDraft);
    if (err === "missing") {
      setKeyMessage(t("settings.byok.missing"));
      return;
    }
    if (err === "invalid_gemini") {
      setKeyMessage(t("settings.byok.invalidGemini"));
      return;
    }
    if (err === "invalid_openai") {
      setKeyMessage(t("settings.byok.invalidOpenai"));
      return;
    }
    setSavingKey(true);
    const res = await upsertHouseholdKitchenAi({
      householdId,
      userId: user.id,
      provider,
      apiKey: keyDraft,
    });
    setSavingKey(false);
    if (!res.ok) {
      setKeyMessage(
        res.message === "SCHEMA_MISSING"
          ? t("kitchen.ai.error.schema")
          : res.message === "KEY_MISSING"
            ? t("kitchen.ai.error.key")
            : res.message,
      );
      return;
    }
    setKeyDraft("");
    setKeyMessage(t("kitchen.ai.key.saved"));
    hapticTap();
    await loadMeta();
  }

  function copyFromDeviceSettings() {
    const openai = getOpenAIKeyFromStorage();
    const gemini = getGeminiKeyFromStorage();
    if (openai && !validateProviderKey("openai", openai)) {
      setProvider("openai");
      setKeyDraft(openai);
      setKeyMessage(t("kitchen.ai.key.copiedOpenai"));
      return;
    }
    if (gemini && !validateProviderKey("gemini", gemini)) {
      setProvider("gemini");
      setKeyDraft(gemini);
      setKeyMessage(t("kitchen.ai.key.copiedGemini"));
      return;
    }
    setKeyMessage(t("kitchen.ai.key.noLocal"));
  }

  async function clearHouseholdKey() {
    await deleteHouseholdKitchenAi(householdId);
    await loadMeta();
    setKeyMessage(t("kitchen.ai.key.cleared"));
  }

  async function runAssistant() {
    setAiError(null);
    setReply(null);
    setMissing([]);
    setMealIdeas([]);
    const token = session?.access_token;
    if (!token) {
      setAiError(t("kitchen.ai.error.auth"));
      return;
    }
    setLoadingAi(true);
    try {
      const res = await fetch("/api/kitchen/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          householdId,
          locale,
          prompt: prompt.trim() || undefined,
          inventory: inventory.map((r) => ({
            name: r.name,
            category: r.category,
            quantity: r.quantity,
            unit: r.unit,
            expiry_date: r.expiry_date,
          })),
          shopping: shopping.map((r) => ({ title: r.title, status: r.status })),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        message?: string;
        reply?: string;
        missing_for_cart?: string[];
        meal_ideas?: string[];
      };

      if (!res.ok || !data.ok) {
        const code = data.code ?? "UNKNOWN";
        if (code === "NO_HOUSEHOLD_AI") setAiError(t("kitchen.ai.error.noKey"));
        else if (code === "NOT_MEMBER") setAiError(t("kitchen.ai.error.notMember"));
        else setAiError(data.message ?? t("kitchen.ai.error.generic"));
        return;
      }

      setReply(data.reply ?? "");
      setMissing(data.missing_for_cart ?? []);
      setMealIdeas(data.meal_ideas ?? []);
      hapticTap();
    } catch {
      setAiError(t("kitchen.ai.error.generic"));
    } finally {
      setLoadingAi(false);
    }
  }

  async function addOneToCart(title: string, fromAi: boolean) {
    try {
      await addShoppingItem({
        householdId,
        title,
        quantity: 1,
        suggestedByAi: fromAi,
      });
      hapticTap();
      await onReload();
    } catch {
      setAiError(t("kitchen.ai.error.addCart"));
    }
  }

  const hasKey = Boolean(meta?.provider);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-secondary)]">
          {t("kitchen.ai.householdKey")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-secondary)]">
          {t("kitchen.ai.householdKeyHint")}
        </p>
        {meta ? (
          <p className="mt-2 text-sm text-[color:var(--color-text)]">
            {t("kitchen.ai.key.status")}: {meta.provider.toUpperCase()}
            {meta.key_last_four ? ` · ••••${meta.key_last_four}` : ""}
          </p>
        ) : (
          <p className="mt-2 text-sm text-[color:var(--color-secondary)]">{t("kitchen.ai.key.missing")}</p>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AiProvider)}
            className="rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)]"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
          <input
            type="password"
            autoComplete="off"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder={t("kitchen.ai.key.placeholder")}
            className="rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)]"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={savingKey || !keyDraft.trim()}
            onClick={() => void saveHouseholdKey()}
            className="rounded-xl bg-[color:var(--color-primary)] px-3 py-2 text-xs font-semibold text-[color:var(--color-background)] disabled:opacity-50"
          >
            {t("kitchen.ai.key.save")}
          </button>
          <button
            type="button"
            onClick={copyFromDeviceSettings}
            className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-xs font-medium text-[color:var(--color-text)]"
          >
            {t("kitchen.ai.key.fromSettings")}
          </button>
          {hasKey ? (
            <button
              type="button"
              onClick={() => void clearHouseholdKey()}
              className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-xs text-[color:var(--color-secondary)]"
            >
              {t("kitchen.ai.key.remove")}
            </button>
          ) : null}
        </div>
        {keyMessage ? <p className="mt-2 text-xs text-[color:var(--color-secondary)]">{keyMessage}</p> : null}
      </div>

      <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/35 p-3">
        <p className="text-sm font-semibold text-[color:var(--color-text)]">{t("kitchen.ai.askTitle")}</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder={t("kitchen.ai.askPlaceholder")}
          disabled={!hasKey}
          className="mt-2 w-full resize-none rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)] disabled:opacity-50"
        />
        <button
          type="button"
          disabled={!hasKey || loadingAi}
          onClick={() => void runAssistant()}
          className="mt-2 w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)] disabled:opacity-50"
        >
          {loadingAi ? t("kitchen.ai.thinking") : t("kitchen.ai.run")}
        </button>
        {aiError ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{aiError}</p> : null}
        {reply ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm leading-relaxed text-[color:var(--color-text)]">{reply}</p>
            {mealIdeas.length > 0 ? (
              <ul className="list-inside list-disc text-sm text-[color:var(--color-secondary)]">
                {mealIdeas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {missing.length > 0 ? (
          <div className="mt-3 space-y-2 border-t border-[color:var(--color-surface-border)] pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]">
              {t("kitchen.ai.suggestedCart")}
            </p>
            {missing.map((line) => (
              <div key={line} className="flex items-center justify-between gap-2 rounded-xl border border-[color:var(--color-surface-border)] px-2 py-2">
                <span className="text-sm text-[color:var(--color-text)]">{line}</span>
                <button
                  type="button"
                  onClick={() => void addOneToCart(line, true)}
                  className="shrink-0 rounded-lg border border-[color:var(--color-primary)] px-2 py-1 text-xs font-medium text-[color:var(--color-primary)]"
                >
                  {t("kitchen.ai.addOne")}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
