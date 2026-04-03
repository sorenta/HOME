"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  type BodyGoal,
  type QuitGoal,
  type QuitIntensity,
  type QuitSubkind,
  type WellnessGoal,
  newId,
} from "@/lib/reset-wellness";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                 */
/* ------------------------------------------------------------------ */

type Props = {
  onComplete: (goals: WellnessGoal[], startedAtIso: string) => void;
  onSkip: () => void;
};

const DRAFT_KEY = "majapps-reset-onboarding-draft";

const QUIT_OPTIONS: { subkind: QuitSubkind; labelKey: string; feedbackKey: string; emoji: string }[] = [
  { subkind: "sugar",   labelKey: "reset.wellness.quit.sugar",   feedbackKey: "reset.onboarding.feedback.sugar",   emoji: "🍬" },
  { subkind: "coffee",  labelKey: "reset.wellness.quit.coffee",  feedbackKey: "reset.onboarding.feedback.coffee",  emoji: "☕" },
  { subkind: "smoking", labelKey: "reset.wellness.quit.smoking", feedbackKey: "reset.onboarding.feedback.smoking", emoji: "🚭" },
  { subkind: "custom",  labelKey: "reset.wellness.quit.custom",  feedbackKey: "reset.onboarding.feedback.custom",  emoji: "✨" },
];

const BODY_OPTIONS: { mode: BodyGoal["mode"]; labelKey: string; feedbackKey: string; emoji: string }[] = [
  { mode: "weight_loss", labelKey: "reset.wellness.body.weightLoss", feedbackKey: "reset.onboarding.feedback.weightLoss", emoji: "⚖️" },
  { mode: "bulk",        labelKey: "reset.wellness.body.bulk",       feedbackKey: "reset.onboarding.feedback.bulk",       emoji: "💪" },
  { mode: "lean",        labelKey: "reset.wellness.body.lean",       feedbackKey: "reset.onboarding.feedback.lean",       emoji: "🏃" },
];

const INTENSITY_OPTIONS: { value: QuitIntensity; labelKey: string; hint: string }[] = [
  { value: "reduce", labelKey: "reset.onboarding.intensity.reduce", hint: "🌱" },
  { value: "easy",   labelKey: "reset.onboarding.intensity.easy",   hint: "🟢" },
  { value: "medium", labelKey: "reset.onboarding.intensity.medium", hint: "🟡" },
  { value: "hard",   labelKey: "reset.onboarding.intensity.hard",   hint: "🔴" },
];

/* ------------------------------------------------------------------ */
/*  Draft persistence helpers                                         */
/* ------------------------------------------------------------------ */

type Draft = {
  step: number;
  quitSelected: Record<QuitSubkind, boolean>;
  bodySelected: Record<BodyGoal["mode"], boolean>;
  customLabel: string;
  startedAt: string;
  reasons: Partial<Record<QuitSubkind, string>>;
  intensities: Partial<Record<QuitSubkind, QuitIntensity>>;
  sharePublic: Partial<Record<QuitSubkind, boolean>>;
};

function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch { return null; }
}

function saveDraft(d: Draft): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* quota */ }
}

function clearDraft(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
}

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function ResetWellnessOnboarding({ onComplete, onSkip }: Props) {
  const { t } = useI18n();

  /* ---------- state (hydrated from draft if available) ---------- */
  const draft = useMemo(() => loadDraft(), []);

  const [step, setStep] = useState(draft?.step ?? 0);
  const [quitSelected, setQuitSelected] = useState<Record<QuitSubkind, boolean>>(
    draft?.quitSelected ?? { sugar: false, coffee: false, smoking: false, custom: false },
  );
  const [bodySelected, setBodySelected] = useState<Record<BodyGoal["mode"], boolean>>(
    draft?.bodySelected ?? { weight_loss: false, bulk: false, lean: false },
  );
  const [customLabel, setCustomLabel] = useState(draft?.customLabel ?? "");
  const [startedAt, setStartedAt] = useState(draft?.startedAt ?? nowLocal);
  const [reasons, setReasons] = useState<Partial<Record<QuitSubkind, string>>>(draft?.reasons ?? {});
  const [intensities, setIntensities] = useState<Partial<Record<QuitSubkind, QuitIntensity>>>(draft?.intensities ?? {});
  const [sharePublic, setSharePublic] = useState<Partial<Record<QuitSubkind, boolean>>>(draft?.sharePublic ?? {});

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  /* ---------- derived ---------- */
  const quitCount = useMemo(() => Object.values(quitSelected).filter(Boolean).length, [quitSelected]);
  const bodyCount = useMemo(() => Object.values(bodySelected).filter(Boolean).length, [bodySelected]);
  const needsStartStep = quitCount > 0;
  // Steps: quit path → 0=goals, 1=details, 2=start date, 3=summary
  //        body-only → 0=goals, 1=summary
  const lastStep = needsStartStep ? 3 : 1;

  const startedAtInFuture = useMemo(() => {
    try { return new Date(startedAt).getTime() > Date.now(); } catch { return false; }
  }, [startedAt]);

  /* ---------- draft auto-save ---------- */
  const currentDraft = useMemo((): Draft => ({
    step, quitSelected, bodySelected, customLabel, startedAt, reasons, intensities, sharePublic,
  }), [step, quitSelected, bodySelected, customLabel, startedAt, reasons, intensities, sharePublic]);

  useEffect(() => { saveDraft(currentDraft); }, [currentDraft]);

  /* ---------- feedback flash ---------- */
  const showFeedback = useCallback((msg: string) => {
    setFeedbackMsg(msg);
    setFeedbackVisible(true);
    const tid = setTimeout(() => setFeedbackVisible(false), 3000);
    return () => clearTimeout(tid);
  }, []);

  /* ---------- toggles ---------- */
  function toggleQuit(sub: QuitSubkind) {
    const next = !quitSelected[sub];
    setQuitSelected((c) => ({ ...c, [sub]: next }));
    if (next) {
      const opt = QUIT_OPTIONS.find((o) => o.subkind === sub);
      if (opt) showFeedback(t(opt.feedbackKey));
    }
  }

  function toggleBody(mode: BodyGoal["mode"]) {
    const next = !bodySelected[mode];
    setBodySelected((c) => ({ ...c, [mode]: next }));
    if (next) {
      const opt = BODY_OPTIONS.find((o) => o.mode === mode);
      if (opt) showFeedback(t(opt.feedbackKey));
    }
  }

  /* ---------- build goals ---------- */
  function buildGoals(): WellnessGoal[] {
    const goals: WellnessGoal[] = [];
    const startIso = new Date(startedAt).toISOString();

    for (const { subkind } of QUIT_OPTIONS) {
      if (!quitSelected[subkind]) continue;
      const q: QuitGoal = {
        id: newId(),
        kind: "quit",
        subkind,
        startedAt: startIso,
        reason: reasons[subkind]?.trim() || undefined,
        intensity: intensities[subkind] ?? "medium",
        sharePublic: sharePublic[subkind] ?? false,
      };
      if (subkind === "custom" && customLabel.trim()) q.customLabel = customLabel.trim();
      goals.push(q);
    }

    for (const { mode } of BODY_OPTIONS) {
      if (!bodySelected[mode]) continue;
      goals.push({ id: newId(), kind: "body", mode });
    }

    return goals;
  }

  /* ---------- navigation ---------- */
  function handleNext() {
    if (step < lastStep) { setStep(step + 1); return; }
    const goals = buildGoals();
    const startIso = new Date(startedAt).toISOString();
    clearDraft();
    onComplete(goals, startIso);
  }

  function handleSkip() {
    clearDraft();
    onSkip();
  }

  /* ---------- validation ---------- */
  const canProceedStep0 = quitCount > 0 || bodyCount > 0;

  const canFinish = useMemo(() => {
    if (quitSelected.custom && !customLabel.trim()) return false;
    return true;
  }, [quitSelected.custom, customLabel]);

  /* ---------- active quit options for details step ---------- */
  const activeQuits = useMemo(
    () => QUIT_OPTIONS.filter(({ subkind }) => quitSelected[subkind]),
    [quitSelected],
  );

  /* ---------- summary data ---------- */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const summaryGoals = useMemo(() => buildGoals(), [
    quitSelected, bodySelected, customLabel, startedAt, reasons, intensities, sharePublic,
  ]);

  const stepLabel = `${step + 1}/${lastStep + 1}`;

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  const chipBase = "rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200";
  const chipActive = "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-background)] scale-[1.04]";
  const chipInactive = "border-[color:var(--color-surface-border)] text-[color:var(--color-text)] hover:border-[color:var(--color-primary)]/40";

  return (
    <GlassPanel className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
            {t("reset.wellness.onboarding.eyebrow")}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-theme-display)] text-xl font-semibold text-[color:var(--color-text)]">
            {t("reset.wellness.onboarding.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-secondary)]">
            {t("reset.wellness.onboarding.subtitle")}
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--color-surface-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-secondary)]">
          {stepLabel}
        </span>
      </div>

      {/* Feedback toast */}
      {feedbackMsg && (
        <div
          className={[
            "rounded-xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 px-4 py-2 text-sm font-medium text-[color:var(--color-primary)] transition-all duration-500",
            feedbackVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          {feedbackMsg}
        </div>
      )}

      {/* ---- STEP 0: Pick goals ---- */}
      {step === 0 && (
        <div className="space-y-4">
          {/* Quit goals */}
          <div className="rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("reset.wellness.onboarding.quitHeading")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUIT_OPTIONS.map(({ subkind, labelKey, emoji }) => {
                const active = quitSelected[subkind];
                return (
                  <button
                    key={subkind}
                    type="button"
                    onClick={() => toggleQuit(subkind)}
                    className={[chipBase, active ? chipActive : chipInactive].join(" ")}
                  >
                    {emoji} {t(labelKey)}
                  </button>
                );
              })}
            </div>
            {quitSelected.custom && (
              <label className="mt-3 block text-sm text-[color:var(--color-secondary)]">
                <span className="mb-1 block font-medium text-[color:var(--color-text)]">
                  {t("reset.wellness.onboarding.customLabel")}
                </span>
                <input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
                  placeholder={t("reset.wellness.onboarding.customPlaceholder")}
                />
              </label>
            )}
          </div>

          {/* Body goals */}
          <div className="rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("reset.wellness.onboarding.bodyHeading")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BODY_OPTIONS.map(({ mode, labelKey, emoji }) => {
                const active = bodySelected[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => toggleBody(mode)}
                    className={[chipBase, active ? chipActive : chipInactive].join(" ")}
                  >
                    {emoji} {t(labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---- STEP 1 (quit path): Details — intensity, why, share ---- */}
      {step === 1 && needsStartStep && (
        <div className="space-y-4">
          <p className="text-sm text-[color:var(--color-secondary)]">
            {t("reset.onboarding.details.intro")}
          </p>
          {activeQuits.map(({ subkind, labelKey, emoji }) => (
            <div
              key={subkind}
              className="space-y-3 rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4"
            >
              <p className="text-sm font-semibold text-[color:var(--color-text)]">
                {emoji} {t(labelKey)}
              </p>

              {/* Intensity selector */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[color:var(--color-secondary)]">
                  {t("reset.onboarding.intensity.label")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTENSITY_OPTIONS.map(({ value, labelKey: lk, hint }) => {
                    const active = (intensities[subkind] ?? "medium") === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setIntensities((c) => ({ ...c, [subkind]: value }))}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                          active
                            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/15 text-[color:var(--color-primary)]"
                            : "border-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]",
                        ].join(" ")}
                      >
                        {hint} {t(lk)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Why field */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[color:var(--color-secondary)]">
                  {t("reset.onboarding.why.label")}
                </label>
                <input
                  value={reasons[subkind] ?? ""}
                  onChange={(e) => setReasons((c) => ({ ...c, [subkind]: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
                  placeholder={t("reset.onboarding.why.placeholder")}
                  maxLength={200}
                />
                <p className="mt-1 text-[10px] text-[color:var(--color-secondary)]">
                  {t("reset.onboarding.why.hint")}
                </p>
              </div>

              {/* Share public checkbox */}
              <label className="flex items-center gap-2 text-sm text-[color:var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={sharePublic[subkind] ?? false}
                  onChange={(e) => setSharePublic((c) => ({ ...c, [subkind]: e.target.checked }))}
                  className="rounded border-[color:var(--color-surface-border)] accent-[color:var(--color-primary)]"
                />
                {t("reset.onboarding.share.label")}
              </label>
            </div>
          ))}
        </div>
      )}

      {/* ---- STEP 1 (body-only path): Summary ---- */}
      {step === 1 && !needsStartStep && (
        <SummaryCard goals={summaryGoals} t={t} startedAtInFuture={false} startedAt="" />
      )}

      {/* ---- STEP 2 (quit path): Start date ---- */}
      {step === 2 && needsStartStep && (
        <div className="rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">
            {t("reset.wellness.onboarding.startHeading")}
          </p>
          <p className="text-sm text-[color:var(--color-secondary)]">
            {t("reset.wellness.onboarding.startHint")}
          </p>
          <input
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
          />
          {startedAtInFuture && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              ⏳ {t("reset.onboarding.futureDate.hint")}
            </p>
          )}
        </div>
      )}

      {/* ---- STEP 3 (quit path): Summary / confirmation ---- */}
      {step === 3 && needsStartStep && (
        <SummaryCard goals={summaryGoals} t={t} startedAtInFuture={startedAtInFuture} startedAt={startedAt} />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)]"
          >
            {t("reset.wellness.onboarding.back")}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-secondary)]"
          >
            {t("reset.wellness.onboarding.skip")}
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={
            step === 0
              ? !canProceedStep0
              : step === lastStep
                ? !canFinish
                : false
          }
          className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--color-background)] disabled:opacity-50"
        >
          {step === lastStep
            ? t("reset.wellness.onboarding.finish")
            : t("reset.wellness.onboarding.next")}
        </button>
      </div>
    </GlassPanel>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary card sub-component                                        */
/* ------------------------------------------------------------------ */

function SummaryCard({
  goals,
  t,
  startedAtInFuture,
  startedAt,
}: {
  goals: WellnessGoal[];
  t: (key: string, vars?: Record<string, string>) => string;
  startedAtInFuture: boolean;
  startedAt: string;
}) {
  const quits = goals.filter((g): g is QuitGoal => g.kind === "quit");
  const bodies = goals.filter((g): g is BodyGoal => g.kind === "body");

  const intensityLabel = (i?: string) => {
    if (!i) return "";
    return t(`reset.onboarding.intensity.${i}`);
  };

  return (
    <div className="space-y-3 rounded-[var(--theme-tile-radius)] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/5 p-4">
      <p className="text-sm font-semibold text-[color:var(--color-text)]">
        {t("reset.onboarding.summary.title")}
      </p>

      {quits.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-secondary)]">
            {t("reset.onboarding.summary.quitGoals")}
          </p>
          {quits.map((q) => (
            <div key={q.id} className="flex flex-wrap items-start gap-2 rounded-xl bg-[color:var(--color-background)]/60 px-3 py-2">
              <span className="text-base">{QUIT_OPTIONS.find((o) => o.subkind === q.subkind)?.emoji ?? "🎯"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[color:var(--color-text)]">
                  {q.customLabel ?? t(`reset.wellness.quit.${q.subkind}`)}
                  {q.intensity && (
                    <span className="ml-2 text-xs text-[color:var(--color-secondary)]">
                      · {intensityLabel(q.intensity)}
                    </span>
                  )}
                </p>
                {q.reason && (
                  <p className="mt-0.5 text-xs italic text-[color:var(--color-secondary)]">
                    &ldquo;{q.reason}&rdquo;
                  </p>
                )}
                {q.sharePublic && (
                  <p className="mt-0.5 text-[10px] font-medium text-[color:var(--color-primary)]">
                    📢 {t("reset.onboarding.share.badge")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {bodies.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-secondary)]">
            {t("reset.onboarding.summary.bodyGoals")}
          </p>
          {bodies.map((b) => (
            <div key={b.id} className="flex items-center gap-2 rounded-xl bg-[color:var(--color-background)]/60 px-3 py-2">
              <span className="text-base">{BODY_OPTIONS.find((o) => o.mode === b.mode)?.emoji ?? "💪"}</span>
              <p className="text-sm font-medium text-[color:var(--color-text)]">
                {t(`reset.wellness.body.${b.mode === "weight_loss" ? "weightLoss" : b.mode}`)}
              </p>
            </div>
          ))}
        </div>
      )}

      {startedAt && (
        <p className="text-xs text-[color:var(--color-secondary)]">
          {startedAtInFuture
            ? `⏳ ${t("reset.onboarding.summary.futureStart", { date: new Date(startedAt).toLocaleDateString() })}`
            : startedAt
              ? `📅 ${t("reset.onboarding.summary.startDate", { date: new Date(startedAt).toLocaleDateString() })}`
              : ""}
        </p>
      )}
    </div>
  );
}
