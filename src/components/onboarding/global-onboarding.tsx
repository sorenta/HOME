"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { loadWellnessState, saveWellnessState, type ResetWellnessV1 } from "@/lib/reset-wellness";
import { useAuth } from "@/components/providers/auth-provider";
import { AppSectionIcon } from "@/components/icons";
import { useTheme } from "@/components/providers/theme-provider";
import Image from "next/image";

type StepId = "welcome" | "dashboard" | "kitchen" | "household" | "reset_intro" | "reset_config" | "finish";

export function GlobalOnboarding({ onComplete }: { onComplete: () => void }) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const { themeId } = useTheme();
  const [step, setStep] = useState<StepId>("welcome");
  
  // RESET Config State (Integrated into the grand tour)
  const [wellness, setWellness] = useState<ResetWellnessV1 | null>(null);
  const [primaryGoal] = useState("wellbeing"); // Keeping primaryGoal to read it, but removed setPrimaryGoal as it wasn't used
  const [trackMetrics, setTrackMetrics] = useState<string[]>(["mood", "energy", "sleep"]);

  // Block scrolling while onboarding is active and load initial state
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // We delay the state update slightly to avoid synchronous cascading renders
    setTimeout(() => {
      const data = loadWellnessState();
      if (data) setWellness(data);
    }, 0);
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleFinish = () => {
    hapticTap();
    // Save the integrated RESET config
    if (wellness) {
      saveWellnessState({
        ...wellness,
        onboardingDone: true,
        onboardingProfile: {
          ...wellness.onboardingProfile,
          primaryGoal: primaryGoal as "weight" | "wellbeing" | "sleep" | "stress",
          trackMetrics: trackMetrics as string[],
        }
      });
    }
    // Mark global onboarding as complete in localStorage
    const tourKey = `maj-global-tour-complete-${user?.id ?? "anon"}`;
    localStorage.setItem(tourKey, "true");
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
    <div className={`fixed inset-0 z-[9999] pointer-events-auto flex flex-col justify-center px-4 py-8 transition-colors duration-700 ${
      step === "welcome" ? "items-center bg-background/80 backdrop-blur-xl" : "items-center bg-background/20"
    }`}>
      <div className={`w-full max-w-sm relative transition-all duration-500 ${step === "welcome" ? "" : "mt-auto pb-20"}`}>
        
        {/* H:O Assistant Animated Character - Popping up from bottom */}
        <motion.div 
          layout
          initial={step === "welcome" ? { scale: 3.5, opacity: 0, y: "100vh" } : false}
          animate={step === "welcome" ? "welcome" : "tour"}
          variants={{
            welcome: {
              scale: 3.5, // Ļoti liels mērogs, bet stabili uzstādīts jau sākumā
              opacity: 1,
              y: "15vh", // Izlien no ekrāna apakšas, redzama galva un pleci
              rotate: [0, -5, 3, -4, 2, 0, 0, 0, 0], // Nedaudz lēnāka "šūpošanās", nevis traka lidošana
              transition: {
                y: {
                  type: "spring",
                  bounce: 0.2, // Nedaudz "atsitas" atnākot
                  duration: 2.5 // Gludi iznirst 2.5 sekunžu laikā
                },
                opacity: {
                  duration: 1
                },
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }
              }
            },
            tour: {
              scale: 1,
              opacity: 1,
              y: [0, -8, 0], // The continuous hover
              rotate: 0,
              transition: {
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                scale: {
                  type: "spring",
                  bounce: 0.4,
                  duration: 1
                }
              }
            }
          }}
          className={`mx-auto relative flex items-center justify-center transition-all duration-700 ${
            step === "welcome" 
              ? "z-0 mb-12 h-72 w-72 drop-shadow-[0_40px_80px_rgba(var(--color-primary-rgb),0.6)]" 
              : "z-50 mb-3 h-16 w-16 drop-shadow-[0_10px_20px_rgba(var(--color-primary-rgb),0.2)]"
          }`}
        >
          <Image 
            src="/asistenta-izskats/ho-assistant.png" 
            alt="H:O Assistant" 
            fill
            className={`object-contain pointer-events-none ${step === "welcome" ? "origin-bottom" : ""}`}
            priority
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6 relative z-10"
            >
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {locale === "lv" ? "Iepazīsimies?" : "Shall we get acquainted?"}
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed">
                {locale === "lv" 
                  ? "Es esmu H:O (vari mani saukt par Haosa Organizatoru, Helpu, varbūt Haosa Olimpu... sauc kā gribi!). Esmu šeit, lai palīdzētu tev atbrīvot galvu no simtiem sīkumu un mājas darbu, kas nemitīgi rosās tavā prātā." 
                  : "I'm H:O (feel free to call me House Organizer, Hero of Order, Helper, or maybe Haven Optimizer... call me what you like!). I'm here to help you clear your head of the hundreds of little tasks and chores constantly buzzing in your mind."}
              </p>
              <button
                onClick={() => nextStep("dashboard")}
                className="mt-8 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-background transition-transform active:scale-95 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]"
              >
                {locale === "lv" ? "Sākam ekskursiju!" : "Let's start the tour!"}
              </button>
            </motion.div>
          )}

          {step === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="text-center space-y-3 bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-3xl shadow-2xl relative"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center mb-2 text-primary shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.6)]">
                <AppSectionIcon sectionId="home" themeId={themeId} size={24} tone="active" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {locale === "lv" ? "Tavs Jaunais Sākums" : "Your New Home"}
              </h2>
              <p className="text-sm text-foreground/80 leading-snug">
                {locale === "lv"
                  ? "Šis ir tavs galvenais vadības panelis. Te mēs vienā mirklī redzēsim svarīgākos ikdienas uzdevumus un īsceļus."
                  : "This is your main control center. Here we'll see your most important daily tasks and shortcuts at a glance."}
              </p>
              
              <button
                onClick={() => nextStep("kitchen")}
                className="w-full mt-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
              >
                {locale === "lv" ? "Skaidrs. Kur tālāk?" : "Got it. Where to next?"}
              </button>
            </motion.div>
          )}

          {step === "kitchen" && (
            <motion.div
              key="kitchen"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="text-center space-y-3 bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-3xl shadow-2xl relative"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                <span className="text-lg">🍳</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {locale === "lv" ? "Gudrā Virtuve" : "Smart Kitchen"}
              </h2>
              <p className="text-sm text-foreground/80 leading-snug">
                {locale === "lv"
                  ? "Aizmirsti par 'Ko šodien ēdīsim?'. Mans AI šefpavārs sakombinēs receptes no visa, kas atrodas tavā ledusskapī."
                  : "Forget 'What are we eating today?'. My AI chef will combine recipes from everything in your fridge."}
              </p>
              <button
                onClick={() => nextStep("household")}
                className="w-full mt-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
              >
                {locale === "lv" ? "Skan garšīgi. Kas tālāk?" : "Sounds delicious. What's next?"}
              </button>
            </motion.div>
          )}

          {step === "household" && (
            <motion.div
              key="household"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="text-center space-y-3 bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-3xl shadow-2xl relative"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                <span className="text-lg">👨‍👩‍👧‍👦</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {locale === "lv" ? "Mājsaimniecība" : "Household"}
              </h2>
              <p className="text-sm text-foreground/80 leading-snug">
                {locale === "lv"
                  ? "Šeit mēs organizējam ģimenes budžetu, kalendāru un aptieciņu vienuviet – viss reāllaikā un sasniedzams ikvienam."
                  : "Here we organize the family budget, calendar, and pharmacy in one place – all real-time and accessible to everyone."}
              </p>
              <button
                onClick={() => nextStep("reset_intro")}
                className="w-full mt-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
              >
                {locale === "lv" ? "Lieliski. Ejam tālāk!" : "Great. Let's move on!"}
              </button>
            </motion.div>
          )}

          {step === "reset_intro" && (
            <motion.div
              key="reset_intro"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="text-center space-y-3 bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-3xl shadow-2xl relative"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <span className="text-lg">🌿</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {locale === "lv" ? "Tava miera osta: RESET" : "Your safe haven: RESET"}
              </h2>
              <p className="text-sm text-foreground/80 leading-snug">
                {locale === "lv"
                  ? "RESET ir tikai tava personīgā, privātā telpa. Šeit tu fiksē savu noskaņojumu un miegu, un atgūsti enerģiju."
                  : "RESET is strictly your personal, private space. Here you track your mood and sleep, and regain your energy."}
              </p>
              <button
                onClick={() => nextStep("reset_config")}
                className="w-full mt-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 transition-transform active:scale-95"
              >
                {locale === "lv" ? "Pielāgot manu RESET" : "Customize my RESET"}
              </button>
            </motion.div>
          )}

          {step === "reset_config" && (
            <motion.div
              key="reset_config"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="space-y-4 bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-3xl shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-foreground text-center">
                {locale === "lv" ? "Kas tev ir svarīgi?" : "What is important to you?"}
              </h2>
              <p className="text-xs text-center text-foreground/60 leading-snug">
                {locale === "lv" 
                  ? "Atzīmē to, kam vēlies sekot līdzi ikdienā." 
                  : "Select what you want to track daily."}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
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
                      className={`flex items-center justify-start gap-2 rounded-xl border p-2 transition-all ${
                        isActive 
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "border-border/50 bg-background/50 text-foreground/50 hover:bg-background/80"
                      }`}
                    >
                      <span className="text-lg">{metric.icon}</span>
                      <span className="text-xs font-semibold">{metric.label}</span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => nextStep("finish")}
                disabled={trackMetrics.length === 0}
                className="w-full mt-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-transform active:scale-95 disabled:opacity-50"
              >
                {locale === "lv" ? "Saglabāt" : "Save"}
              </button>
            </motion.div>
          )}

          {step === "finish" && (
            <motion.div
              key="finish"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-3 bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-3xl shadow-2xl relative"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {locale === "lv" ? "Viss ir gatavs!" : "Everything is set!"}
              </h2>
              <p className="text-sm text-foreground/70 leading-snug">
                {locale === "lv" ? "Tava jaunā māja ir sakārtota. Ejam iekšā!" : "Your new home is organized. Let's enter!"}
              </p>
              <button
                onClick={handleFinish}
                className="mt-2 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
              >
                {locale === "lv" ? "Atvērt durvis" : "Open the door"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
