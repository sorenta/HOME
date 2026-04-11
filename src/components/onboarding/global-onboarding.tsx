"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { useResetWellness } from "@/lib/reset-wellness";

type StepId = "welcome" | "kitchen" | "logistics" | "reset_intro" | "reset_config" | "finish";

export function GlobalOnboarding({ onComplete }: { onComplete: () => void }) {
  const { t, locale } = useI18n();
  const [step, setStep] = useState<StepId>("welcome");
  
  // RESET Config State (Integrated into the grand tour)
  const [wellness, setWellness] = useResetWellness();
  const [primaryGoal, setPrimaryGoal] = useState("wellbeing");
  const [trackMetrics, setTrackMetrics] = useState<string[]>(["mood", "energy", "sleep"]);

  // Block scrolling while onboarding is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleFinish = () => {
    hapticTap();
    // Save the integrated RESET config
    setWellness({
      ...wellness,
      onboardingComplete: true,
      primaryGoal: primaryGoal as any,
      trackMetrics: trackMetrics as any,
    });
    // Mark global onboarding as complete in localStorage
    localStorage.setItem("maj-global-tour-complete", "true");
    onComplete();
  };

  const nextStep = (next: StepId) => {
    hapticTap();
    setStep(next);
  };

  const toggleMetric = (m: string) => {
    hapticTap();
    setTrackMetrics(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 px-4 py-8 backdrop-blur-xl">
      <div className="w-full max-w-md relative">
        
        {/* H:O Assistant Avatar/Badge */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)]"
        >
          <span className="font-(family-name:--font-rajdhani) text-2xl font-bold text-primary tracking-widest">
            H:O
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {locale === "lv" ? "Iepazīsimies." : "Let's get to know each other."}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                {locale === "lv" 
                  ? "Mani sauc H:O. Esmu šeit, lai palīdzētu tev atbrīvot galvu no 100 darāmajiem mājas darbiem un sīkumiem." 
                  : "I am H:O. I am here to help you clear your head from 100 pending household chores and details."}
              </p>
              <button
                onClick={() => nextStep("kitchen")}
                className="mt-8 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-background transition-transform active:scale-95"
              >
                {locale === "lv" ? "Sākam ekskursiju" : "Start the tour"}
              </button>
            </motion.div>
          )}

          {step === "kitchen" && (
            <motion.div
              key="kitchen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <span className="text-2xl">🍳</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {locale === "lv" ? "Gudrā Virtuve" : "Smart Kitchen"}
              </h2>
              <p className="text-base text-white/70 leading-relaxed">
                {locale === "lv"
                  ? "Vairs nekādu 'Ko šodien ēdīsim?'. Pievieno produktus, ko nopirki, un mans AI šefpavārs sakombinēs no tiem izcilas receptes. Tukšojam ledusskapi gudri."
                  : "No more 'What are we eating today?'. Add ingredients you bought, and my AI chef will combine them into great recipes. Let's empty the fridge smartly."}
              </p>
              <button
                onClick={() => nextStep("logistics")}
                className="w-full rounded-2xl bg-white/10 border border-white/20 px-6 py-4 text-base font-medium text-white transition-all hover:bg-white/20 active:scale-95"
              >
                {locale === "lv" ? "Skan labi. Kas tālāk?" : "Sounds good. What's next?"}
              </button>
            </motion.div>
          )}

          {step === "logistics" && (
            <motion.div
              key="logistics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {locale === "lv" ? "Loģistika un Sinhronizācija" : "Logistics & Sync"}
              </h2>
              <p className="text-base text-white/70 leading-relaxed">
                {locale === "lv"
                  ? "Iepirkumu saraksts, mājas kalendārs un aptieciņas krājumi sinhronizējas starp visiem mājiniekiem reāllaikā. Ja kāds kaut ko pievieno, tu to uzreiz redzi."
                  : "Shopping lists, home calendar, and pharmacy stocks sync across all household members in real-time. If someone adds something, you see it instantly."}
              </p>
              <button
                onClick={() => nextStep("reset_intro")}
                className="w-full rounded-2xl bg-white/10 border border-white/20 px-6 py-4 text-base font-medium text-white transition-all hover:bg-white/20 active:scale-95"
              >
                {locale === "lv" ? "Lieliski. Ejam tālāk" : "Great. Let's move on"}
              </button>
            </motion.div>
          )}

          {step === "reset_intro" && (
            <motion.div
              key="reset_intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {locale === "lv" ? "Tava Privātā Telpa: RESET" : "Your Private Space: RESET"}
              </h2>
              <p className="text-base text-white/70 leading-relaxed">
                {locale === "lv"
                  ? "Visbeidzot – pati svarīgākā vieta. RESET ir modulis tikai un vienīgi tev. Šeit tu vari fiksēt savu noskaņojumu, miegu un atgūt mieru. Mājinieki tavas piezīmes neredzēs."
                  : "Finally – the most important place. RESET is a module strictly for you. Here you can log your mood, sleep, and find peace. Household members won't see your notes."}
              </p>
              <button
                onClick={() => nextStep("reset_config")}
                className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold text-black transition-transform active:scale-95"
              >
                {locale === "lv" ? "Pielāgot manu RESET" : "Customize my RESET"}
              </button>
            </motion.div>
          )}

          {step === "reset_config" && (
            <motion.div
              key="reset_config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white text-center">
                {locale === "lv" ? "Ko vēlies fiksēt ikdienā?" : "What do you want to track daily?"}
              </h2>
              <p className="text-sm text-center text-white/60">
                {locale === "lv" 
                  ? "Atzīmē tikai to, kas tev patiešām rūp. Mēs paslēpsim visu pārējo, lai ekrāns būtu tīrs." 
                  : "Select only what truly matters to you. We will hide everything else to keep the screen clean."}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "mood", icon: "😌", label: locale === "lv" ? "Noskaņojums" : "Mood" },
                  { id: "energy", icon: "⚡", label: locale === "lv" ? "Enerģija" : "Energy" },
                  { id: "sleep", icon: "🌙", label: locale === "lv" ? "Miegs" : "Sleep" },
                  { id: "steps", icon: "🚶", label: locale === "lv" ? "Aktivitāte" : "Activity" },
                  { id: "weight", icon: "⚖️", label: locale === "lv" ? "Svars" : "Weight" },
                ].map(metric => {
                  const isActive = trackMetrics.includes(metric.id);
                  return (
                    <button
                      key={metric.id}
                      onClick={() => toggleMetric(metric.id)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                        isActive 
                          ? "border-emerald-500 bg-emerald-500/20 text-white" 
                          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-2xl">{metric.icon}</span>
                      <span className="text-xs font-semibold">{metric.label}</span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => nextStep("finish")}
                disabled={trackMetrics.length === 0}
                className="w-full mt-4 rounded-2xl bg-white px-6 py-4 text-base font-bold text-black transition-transform active:scale-95 disabled:opacity-50"
              >
                {locale === "lv" ? "Gatavs" : "Done"}
              </button>
            </motion.div>
          )}

          {step === "finish" && (
            <motion.div
              key="finish"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">
                {locale === "lv" ? "Viss ir sagatavots." : "Everything is set."}
              </h2>
              <p className="text-lg text-white/70">
                {locale === "lv" ? "Tava jaunā māja tevi gaida." : "Your new home awaits you."}
              </p>
              <button
                onClick={handleFinish}
                className="mt-8 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-background shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-transform hover:scale-105 active:scale-95"
              >
                {locale === "lv" ? "Ieiet iekšā" : "Enter"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
