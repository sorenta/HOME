"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { ResetDashboard } from "@/components/reset/reset-dashboard";
import { ResetOnboardingWizard } from "@/components/reset/reset-onboarding-wizard";
import { ResetThemeLayer } from "@/components/reset/reset-theme-layer";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  defaultWellnessState,
  type ResetOnboardingProfile,
  type ResetWellnessV1,
} from "@/lib/reset-wellness";
import {
  loadWellnessStateSynced,
  persistWellnessStateSynced,
} from "@/lib/reset-wellness-sync";

export default function ResetPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [wellness, setWellness] = useState<ResetWellnessV1>(defaultWellnessState);
  const [hydrated, setHydrated] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let alive = true;

    void loadWellnessStateSynced(user?.id ?? null).then((state) => {
      if (!alive) return;
      setWellness(state);
      setHydrated(true);
    });

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const persistWellness = useCallback(
    (next: ResetWellnessV1) => {
      setWellness(next);
      void persistWellnessStateSynced(user?.id ?? null, next);
    },
    [user?.id],
  );

  const showOnboarding = hydrated && (!wellness.onboardingDone || showQuestionnaire);

  useEffect(() => {
    if (!hydrated) return;

    let nextShowIntro = false;
    if (!wellness.onboardingDone && typeof window !== "undefined") {
      const seenKey = `majapps-reset-intro-seen-${user?.id ?? "anon"}`;
      const seen = window.localStorage.getItem(seenKey) === "true";
      nextShowIntro = !seen;
    }

    const frame = window.requestAnimationFrame(() => {
      setShowIntro(nextShowIntro);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hydrated, user?.id, wellness.onboardingDone]);

  function handleOnboardingComplete(answers: ResetOnboardingProfile) {
    const next: ResetWellnessV1 = {
      ...wellness,
      onboardingDone: true,
      onboardingProfile: answers,
      trackMetrics: answers.trackMetrics,
      quitPlan: answers.quitPlan,
    };
    setShowQuestionnaire(false);
    persistWellness(next);
  }

  return (
    <ModuleShell
      title={locale === "lv" ? "Kā tu šodien jūties?" : "How are you feeling today?"}
      moduleId="reset"
      sectionId="reset"
    >
      <ResetThemeLayer>
        <HiddenSeasonalCollectible spotId="reset" />
        {showIntro ? (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-background)_62%,black)] p-4 backdrop-blur-md sm:p-6">
            <GlassPanel className="w-full max-w-2xl space-y-5 border border-(--color-surface-border) bg-[color-mix(in_srgb,var(--color-card)_92%,white_8%)] p-5 sm:p-7">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                  {locale === "lv" ? "RESET sākuma skaidrojums" : "RESET quick intro"}
                </p>
                <h2 className="text-2xl font-semibold text-(--color-text-primary) sm:text-3xl">
                  {locale === "lv" ? "Sāksim ar īsu anketu" : "Let us start with a short questionnaire"}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-(--color-text-secondary) sm:text-base">
                  {locale === "lv"
                    ? "Atbildi uz 5 jautājumiem, lai RESET sadaļa pielāgotos tieši tev: mērķiem, ritmam un ikdienas paradumiem."
                    : "Answer 5 questions so RESET can adapt to your goals, daily rhythm, and habits."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--color-text-secondary)">1</p>
                  <p className="mt-1 text-sm font-semibold text-(--color-text-primary)">
                    {locale === "lv" ? "Skaidrs sākums" : "Clear start"}
                  </p>
                  <p className="mt-1 text-xs text-(--color-text-secondary)">
                    {locale === "lv" ? "~1 minūtes anketa" : "~1 minute questionnaire"}
                  </p>
                </div>
                <div className="rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--color-text-secondary)">2</p>
                  <p className="mt-1 text-sm font-semibold text-(--color-text-primary)">
                    {locale === "lv" ? "Personisks ritms" : "Personal rhythm"}
                  </p>
                  <p className="mt-1 text-xs text-(--color-text-secondary)">
                    {locale === "lv" ? "Mērķi un paradumi tavā tempā" : "Goals and habits in your pace"}
                  </p>
                </div>
                <div className="rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--color-text-secondary)">3</p>
                  <p className="mt-1 text-sm font-semibold text-(--color-text-primary)">
                    {locale === "lv" ? "Pielāgots dashboard" : "Tailored dashboard"}
                  </p>
                  <p className="mt-1 text-xs text-(--color-text-secondary)">
                    {locale === "lv" ? "Ieteikumi tieši pēc tavām atbildēm" : "Suggestions based on your answers"}
                  </p>
                </div>
              </div>

              <div className="rounded-(--radius-card) border border-(--color-surface-border) bg-(--color-surface) p-3">
                <p className="text-sm text-(--color-text-secondary)">
                  {locale === "lv"
                    ? "Atbildes varēsi mainīt jebkurā brīdī RESET sadaļā."
                    : "You can update your answers anytime in RESET."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const seenKey = `majapps-reset-intro-seen-${user?.id ?? "anon"}`;
                    window.localStorage.setItem(seenKey, "true");
                  }
                  setShowIntro(false);
                }}
                className="inline-flex w-full justify-center rounded-theme border border-(--color-accent) bg-(--color-surface-2) px-5 py-3 text-sm font-semibold text-(--color-text-primary)"
              >
                {t("reset.action.continueToQuestionnaire")}
              </button>
            </GlassPanel>
          </div>
        ) : null}

        {!hydrated ? null : showOnboarding ? (
          <div className="space-y-3">
            {wellness.onboardingDone ? (
              <button
                type="button"
                onClick={() => setShowQuestionnaire(false)}
                className="inline-flex rounded-full border border-(--color-surface-border) bg-(--color-surface) px-4 py-2 text-sm text-(--color-text-secondary)"
              >
                {t("nav.back")}
              </button>
            ) : null}

            <ResetOnboardingWizard
              initial={wellness.onboardingProfile}
              onComplete={handleOnboardingComplete}
            />
          </div>
        ) : (
          <ResetDashboard
            wellness={wellness}
            userId={user?.id ?? null}
            onOpenQuestionnaire={() => setShowQuestionnaire(true)}
            onUpdate={persistWellness}
          />
        )}
      </ResetThemeLayer>
    </ModuleShell>
  );
}
