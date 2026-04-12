"use client";

import { useEffect, useState, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { loadWellnessState, saveWellnessState, type ResetWellnessV1 } from "@/lib/reset-wellness";
import { useAuth } from "@/components/providers/auth-provider";
import { AppSectionIcon } from "@/components/icons";
import { useTheme } from "@/components/providers/theme-provider";
import Image from "next/image";
import Spline from '@splinetool/react-spline';

type StepId = "welcome" | "dashboard" | "kitchen" | "household" | "reset_intro" | "reset_config" | "finish";

export function GlobalOnboarding({ onComplete }: { onComplete: () => void }) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const { themeId } = useTheme();
  const [step, setStep] = useState<StepId>("welcome");
  const [mounted, setMounted] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  
  // RESET Config State (Integrated into the grand tour)
  const [wellness, setWellness] = useState<ResetWellnessV1 | null>(null);
  const [primaryGoal] = useState("wellbeing");
  const [trackMetrics, setTrackMetrics] = useState<string[]>(["mood", "energy", "sleep"]);

  // Block scrolling while onboarding is active, load initial state, and mark as mounted for Portal
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
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
          trackMetrics: trackMetrics as ResetTrackMetric[],
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

  // Only render the portal if the component has mounted on the client-side
  // and the document object exists (to avoid SSR build errors)
  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(content, document.body);
}
