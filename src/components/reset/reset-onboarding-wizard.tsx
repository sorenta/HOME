"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  defaultResetOnboardingProfile,
  type ResetOnboardingProfile,
  type ResetTrackMetric,
} from "@/lib/reset-wellness";

type Props = {
  initial: ResetOnboardingProfile;
  onComplete: (answers: ResetOnboardingProfile) => void;
};

type Option<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

const totalSteps = 5;

function ConversationStep({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
          {eyebrow}
        </p>
        <h2 className="text-xl font-semibold text-(--color-text-primary)">{title}</h2>
        <p className="text-sm text-(--color-text-secondary)">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

export function ResetOnboardingWizard({ initial, onComplete }: Props) {
  const { t } = useI18n();
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ResetOnboardingProfile>(
    initial ?? defaultResetOnboardingProfile(),
  );

  const goalOptions: Option<ResetOnboardingProfile["primaryGoal"]>[] = [
    { value: "weight", label: tr("reset.wellness.body.weightLoss", "Svara zaudesana"), hint: tr("reset.onboarding.goalHint.weight", "Sakartosim svara dinamiku un paradumus") },
    { value: "wellbeing", label: tr("reset.dashboard.goal.wellbeing", "Labsajuta"), hint: tr("reset.onboarding.goalHint.wellbeing", "Vairak miera un stabils ikdienas ritms") },
    { value: "sleep", label: tr("reset.dashboard.goal.sleep", "Miegs"), hint: tr("reset.onboarding.goalHint.sleep", "Labaka miega kvalitate un vakara rutina") },
    { value: "stress", label: tr("reset.dashboard.goal.stress", "Stress"), hint: tr("reset.onboarding.goalHint.stress", "Mazak spriedzes un vairak kontroles") },
  ];

  const profileOptions: Option<"desk" | "active" | "mixed">[] = [
    { value: "desk", label: tr("reset.onboarding.profile.desk", "Sedoss darbs") },
    { value: "active", label: tr("reset.onboarding.profile.active", "Aktivs") },
    { value: "mixed", label: tr("reset.onboarding.profile.mixed", "Jaukts ritms") },
  ];

  const metricOptions: Option<ResetTrackMetric>[] = [
    { value: "weight", label: tr("reset.dashboard.metric.weight", "Svars") },
    { value: "steps", label: tr("reset.dashboard.metric.steps", "Soli") },
    { value: "mood", label: tr("reset.dashboard.metric.mood", "Noskanojums") },
    { value: "sleep", label: tr("reset.dashboard.metric.sleep", "Miegs") },
  ];

  const frequencyOptions: Option<ResetOnboardingProfile["checkInFrequency"]>[] = [
    { value: "daily", label: tr("reset.onboarding.frequency.daily", "Katru dienu") },
    { value: "weekdays", label: tr("reset.onboarding.frequency.weekdays", "Darba dienas") },
    { value: "three_per_week", label: tr("reset.onboarding.frequency.three_per_week", "3x nedela") },
  ];

  const quitOptions: Option<NonNullable<ResetOnboardingProfile["quitPlan"]>["habit"]>[] = [
    { value: "smoking", label: tr("reset.dashboard.habit.smoking", "Smesana") },
    { value: "sweets", label: tr("reset.dashboard.habit.sweets", "Saldumi") },
    { value: "snacking", label: tr("reset.dashboard.habit.snacking", "Uzkodas") },
    { value: "other", label: tr("reset.dashboard.habit.other", "Cits") },
  ];

  const stepLabel = useMemo(() => `${step + 1}/${totalSteps}`, [step]);

  const canContinue = useMemo(() => {
    if (step === 2) return answers.trackMetrics.length > 0;
    if (step === 4 && answers.quitPlan) return Boolean(answers.quitPlan.startedOn);
    return true;
  }, [answers.quitPlan, answers.trackMetrics.length, step]);

  function toggleMetric(metric: ResetTrackMetric) {
    setAnswers((prev) => {
      const has = prev.trackMetrics.includes(metric);
      return {
        ...prev,
        trackMetrics: has
          ? prev.trackMetrics.filter((item) => item !== metric)
          : [...prev.trackMetrics, metric],
      };
    });
  }

  function selectQuitHabit(habit: NonNullable<ResetOnboardingProfile["quitPlan"]>["habit"]) {
    setAnswers((prev) => ({
      ...prev,
      quitPlan: {
        habit,
        startedOn: prev.quitPlan?.startedOn ?? new Date().toISOString().slice(0, 10),
        approach: prev.quitPlan?.approach ?? "reduce",
      },
    }));
  }

  return (
    <GlassPanel className="space-y-6 border border-(--color-surface-border) bg-[color-mix(in_srgb,var(--color-card)_92%,white_8%)] p-4 sm:p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-(--color-text-secondary)">
          {tr("reset.onboarding.flow", "RESET anketa")}
          </p>
          <span className="rounded-full border border-(--color-surface-border) bg-(--color-surface) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
            {stepLabel}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-(--color-surface)">
          <div
            className="h-2 rounded-full bg-(--color-accent) transition-all"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            aria-hidden
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <ConversationStep
            eyebrow={tr("reset.onboarding.questionnaire", "Anketa")}
            title={tr("reset.onboarding.step0.title", "Pielāgosim šo telpu tavam ritmam")}
            subtitle={tr("reset.onboarding.step0.subtitle", "Atzīmē to, kam šobrīd ir spēks sekot līdzi. Mēs paslēpsim visu pārējo.")}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {goalOptions.map((option) => {
                const active = answers.primaryGoal === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, primaryGoal: option.value }))}
                    className={[
                      "rounded-(--radius-card) border px-4 py-3 text-left transition",
                      active
                        ? "border-(--color-accent) bg-(--color-surface-2)"
                        : "border-(--color-surface-border) bg-(--color-surface)",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold text-(--color-text-primary)">{option.label}</p>
                    {option.hint && (
                      <p className="mt-1 text-xs text-(--color-text-secondary)">{option.hint}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </ConversationStep>
        )}

        {step === 1 && (
          <ConversationStep
            eyebrow={tr("reset.onboarding.questionnaire", "Anketa")}
            title={tr("reset.onboarding.step1.title", "Pastasti par savu ikdienu")}
            subtitle={tr("reset.onboarding.step1.subtitle", "Tas palidzes izveidot realu ritmu")}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-secondary)">
                  {tr("reset.onboarding.dayRhythm", "Dienas ritms")}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {profileOptions.map((option) => {
                    const active = answers.profileType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, profileType: option.value }))}
                        className={[
                          "rounded-full border px-4 py-2 text-sm transition",
                          active
                            ? "border-(--color-accent) bg-(--color-surface-2) text-(--color-text-primary)"
                            : "border-(--color-surface-border) bg-(--color-surface) text-(--color-text-secondary)",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-secondary)">
                  {tr("reset.onboarding.currentMood", "Ka jūties pedeja laika?")}
                </p>
                <select
                  value={answers.baselineMood}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, baselineMood: event.target.value as ResetOnboardingProfile["baselineMood"] }))
                  }
                  className="w-full rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text-primary)"
                >
                  <option value="low">{tr("reset.onboarding.baselineMood.low", "Noguris")}</option>
                  <option value="steady">{tr("reset.onboarding.baselineMood.steady", "Stabils")}</option>
                  <option value="high">{tr("reset.onboarding.baselineMood.high", "Energisks")}</option>
                </select>
              </div>
            </div>
          </ConversationStep>
        )}

        {step === 2 && (
          <ConversationStep
            eyebrow={tr("reset.onboarding.questionnaire", "Anketa")}
            title={tr("reset.onboarding.step2.title", "Ko atstājam tavā dienas atsaitē?")}
            subtitle={tr("reset.onboarding.step2.subtitle", "Izvēlies tikai to, kas tev patiešām rūp.")}
          >
            <div className="flex flex-wrap gap-2">
              {metricOptions.map((metric) => {
                const active = answers.trackMetrics.includes(metric.value);
                return (
                  <button
                    key={metric.value}
                    type="button"
                    onClick={() => toggleMetric(metric.value)}
                    className={[
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      active
                        ? "border-(--color-accent) bg-(--color-surface-2) text-(--color-text-primary)"
                        : "border-(--color-surface-border) bg-(--color-surface) text-(--color-text-secondary)",
                    ].join(" ")}
                  >
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </ConversationStep>
        )}

        {step === 3 && (
          <ConversationStep
            eyebrow={tr("reset.onboarding.questionnaire", "Anketa")}
            title={tr("reset.onboarding.step3.title", "Cik biezi veiksi check-in?")}
            subtitle={tr("reset.onboarding.step3.subtitle", "Izvelies ritmu, kas tev ir realistisks")}
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {frequencyOptions.map((option) => {
                const active = answers.checkInFrequency === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, checkInFrequency: option.value }))}
                    className={[
                      "rounded-(--radius-card) border px-4 py-3 text-sm transition",
                      active
                        ? "border-(--color-accent) bg-(--color-surface-2) text-(--color-text-primary)"
                        : "border-(--color-surface-border) bg-(--color-surface) text-(--color-text-secondary)",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </ConversationStep>
        )}

        {step === 4 && (
          <ConversationStep
            eyebrow={tr("reset.onboarding.questionnaire", "Anketa")}
            title={tr("reset.onboarding.step4.title", "Vai ir kads ieradums, ko mainit?")}
            subtitle={tr("reset.onboarding.step4.subtitle", "Vari izveleties ieradumu vai izlaist so soli")}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, quitPlan: null }))}
                  className={[
                    "rounded-full border px-4 py-2 text-sm transition",
                    answers.quitPlan === null
                      ? "border-(--color-accent) bg-(--color-surface-2)"
                      : "border-(--color-surface-border) bg-(--color-surface)",
                  ].join(" ")}
                >
                  {tr("reset.onboarding.notNow", "Pagaidam ne")}
                </button>
                {quitOptions.map((option) => {
                  const active = answers.quitPlan?.habit === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectQuitHabit(option.value)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm transition",
                        active
                          ? "border-(--color-accent) bg-(--color-surface-2)"
                          : "border-(--color-surface-border) bg-(--color-surface)",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {answers.quitPlan && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-(--color-text-secondary)">
                    <span>{tr("reset.onboarding.startDate", "Sakuma datums")}</span>
                    <input
                      type="date"
                      value={answers.quitPlan.startedOn}
                      onChange={(event) =>
                        setAnswers((prev) => ({
                          ...prev,
                          quitPlan: prev.quitPlan
                            ? { ...prev.quitPlan, startedOn: event.target.value }
                            : prev.quitPlan,
                        }))
                      }
                      className="w-full rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) px-3 py-2 text-(--color-text-primary)"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-(--color-text-secondary)">
                    <span>{tr("reset.onboarding.approach", "Pieeja")}</span>
                    <select
                      value={answers.quitPlan.approach}
                      onChange={(event) =>
                        setAnswers((prev) => ({
                          ...prev,
                          quitPlan: prev.quitPlan
                            ? {
                                ...prev.quitPlan,
                                approach: event.target.value as NonNullable<ResetOnboardingProfile["quitPlan"]>["approach"],
                              }
                            : prev.quitPlan,
                        }))
                      }
                      className="w-full rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) px-3 py-2 text-(--color-text-primary)"
                    >
                      <option value="quit">{tr("reset.dashboard.approach.quit", "Atmest")}</option>
                      <option value="reduce">{tr("reset.dashboard.approach.reduce", "Samazinat")}</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
          </ConversationStep>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 border-t border-(--color-surface-border) pt-4">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          disabled={step === 0}
          className="rounded-full border border-(--color-surface-border) bg-(--color-surface) px-4 py-2 text-sm text-(--color-text-secondary) disabled:opacity-40"
        >
          {tr("reset.onboarding.back", "Atpakal")}
        </button>

        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(totalSteps - 1, prev + 1))}
            disabled={!canContinue}
            className="rounded-full border border-(--color-accent) bg-(--color-surface-2) px-4 py-2 text-sm font-semibold text-(--color-text-primary) disabled:opacity-40"
          >
            {tr("reset.onboarding.continue", "Turpinat")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(answers)}
            disabled={!canContinue}
            className="rounded-full border border-(--color-accent) bg-(--color-surface-2) px-4 py-2 text-sm font-semibold text-(--color-text-primary) disabled:opacity-40"
          >
            {tr("reset.onboarding.finish", "Pabeigt anketu")}
          </button>
        )}
      </div>
    </GlassPanel>
  );
}
