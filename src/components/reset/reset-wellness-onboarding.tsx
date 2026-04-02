"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  type BodyGoal,
  type QuitGoal,
  type QuitSubkind,
  type WellnessGoal,
  newId,
} from "@/lib/reset-wellness";

type Props = {
  onComplete: (goals: WellnessGoal[], startedAtIso: string) => void;
  onSkip: () => void;
};

const QUIT_OPTIONS: { subkind: QuitSubkind; labelKey: string }[] = [
  { subkind: "sugar", labelKey: "reset.wellness.quit.sugar" },
  { subkind: "coffee", labelKey: "reset.wellness.quit.coffee" },
  { subkind: "smoking", labelKey: "reset.wellness.quit.smoking" },
  { subkind: "custom", labelKey: "reset.wellness.quit.custom" },
];

const BODY_OPTIONS: { mode: BodyGoal["mode"]; labelKey: string }[] = [
  { mode: "weight_loss", labelKey: "reset.wellness.body.weightLoss" },
  { mode: "bulk", labelKey: "reset.wellness.body.bulk" },
  { mode: "lean", labelKey: "reset.wellness.body.lean" },
];

export function ResetWellnessOnboarding({ onComplete, onSkip }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [quitSelected, setQuitSelected] = useState<Record<QuitSubkind, boolean>>({
    sugar: false,
    coffee: false,
    smoking: false,
    custom: false,
  });
  const [bodySelected, setBodySelected] = useState<Record<BodyGoal["mode"], boolean>>({
    weight_loss: false,
    bulk: false,
    lean: false,
  });
  const [customLabel, setCustomLabel] = useState("");
  const [startedAt, setStartedAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const quitCount = useMemo(
    () => Object.values(quitSelected).filter(Boolean).length,
    [quitSelected],
  );
  const bodyCount = useMemo(
    () => Object.values(bodySelected).filter(Boolean).length,
    [bodySelected],
  );
  const needsStartStep = quitCount > 0;
  const lastStep = needsStartStep ? 2 : 1;

  function toggleQuit(sub: QuitSubkind) {
    setQuitSelected((c) => ({ ...c, [sub]: !c[sub] }));
  }

  function toggleBody(mode: BodyGoal["mode"]) {
    setBodySelected((c) => ({ ...c, [mode]: !c[mode] }));
  }

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
      };
      if (subkind === "custom" && customLabel.trim()) {
        q.customLabel = customLabel.trim();
      }
      goals.push(q);
    }

    for (const { mode } of BODY_OPTIONS) {
      if (!bodySelected[mode]) continue;
      goals.push({
        id: newId(),
        kind: "body",
        mode,
      });
    }

    return goals;
  }

  function handleNext() {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1 && needsStartStep) {
      setStep(2);
      return;
    }
    const goals = buildGoals();
    const startIso = new Date(startedAt).toISOString();
    onComplete(goals, startIso);
  }

  const canProceedStep0 = quitCount > 0 || bodyCount > 0;
  const canFinishLast =
    !quitSelected.custom || customLabel.trim().length > 0 || quitCount === 0;

  return (
    <GlassPanel className="space-y-4">
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
          {step + 1}/{lastStep + 1}
        </span>
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <div className="rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("reset.wellness.onboarding.quitHeading")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUIT_OPTIONS.map(({ subkind, labelKey }) => {
                const active = quitSelected[subkind];
                return (
                  <button
                    key={subkind}
                    type="button"
                    onClick={() => toggleQuit(subkind)}
                    className={[
                      "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-background)]"
                        : "border-[color:var(--color-surface-border)] text-[color:var(--color-text)]",
                    ].join(" ")}
                  >
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>
            {quitSelected.custom ? (
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
            ) : null}
          </div>

          <div className="rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("reset.wellness.onboarding.bodyHeading")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BODY_OPTIONS.map(({ mode, labelKey }) => {
                const active = bodySelected[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => toggleBody(mode)}
                    className={[
                      "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-background)]"
                        : "border-[color:var(--color-surface-border)] text-[color:var(--color-text)]",
                    ].join(" ")}
                  >
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 && needsStartStep ? (
        <div className="rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">
            {t("reset.wellness.onboarding.startHeading")}
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-secondary)]">
            {t("reset.wellness.onboarding.startHint")}
          </p>
          <input
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            className="mt-3 w-full max-w-xs rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-text)]"
          />
        </div>
      ) : null}

      {step === 1 && !needsStartStep ? (
        <p className="text-sm text-[color:var(--color-secondary)]">
          {t("reset.wellness.onboarding.bodyOnlyHint")}
        </p>
      ) : null}

      {step === 2 ? (
        <p className="text-sm text-[color:var(--color-secondary)]">
          {t("reset.wellness.onboarding.reviewHint")}
        </p>
      ) : null}

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
            onClick={onSkip}
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
                ? !canFinishLast
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
