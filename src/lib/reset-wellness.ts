/**
 * RESET wellness goals, body measurements, and training metadata.
 * Local-first persistence (localStorage). No Supabase coupling — safe for production
 * as device-private data; sync can be added later without breaking the shape.
 */

const STORAGE_KEY = "majapps-reset-wellness-v1";

export type BodyArea = "waist" | "hips" | "chest" | "arm" | "thigh";

export type QuitSubkind = "sugar" | "coffee" | "smoking" | "custom";

export type QuitIntensity = "reduce" | "easy" | "medium" | "hard";

export type QuitGoal = {
  id: string;
  kind: "quit";
  subkind: QuitSubkind;
  customLabel?: string;
  startedAt: string;
  /** Why the user chose this goal — strengthens commitment */
  reason?: string;
  /** Intensity / approach level */
  intensity?: QuitIntensity;
  /** Whether the user wants to share this challenge publicly */
  sharePublic?: boolean;
};

export type BodyGoal = {
  id: string;
  kind: "body";
  mode: "weight_loss" | "bulk" | "lean";
};

export type WellnessGoal = QuitGoal | BodyGoal;

export type MeasurementEntry = {
  id: string;
  at: string;
  area: BodyArea;
  valueCm: number;
};

export type WeighInEntry = {
  id: string;
  at: string;
  kg: number;
};

export type ResetTrackMetric = "weight" | "steps" | "mood" | "sleep";

export type ResetQuitPlan = {
  habit: "smoking" | "sweets" | "snacking" | "other";
  startedOn: string;
  approach: "quit" | "reduce";
};

export type ResetOnboardingProfile = {
  primaryGoal: "weight" | "wellbeing" | "sleep" | "stress";
  profileType: "desk" | "active" | "mixed";
  baselineMood: "low" | "steady" | "high";
  trackMetrics: ResetTrackMetric[];
  checkInFrequency: "daily" | "weekdays" | "three_per_week";
  quitPlan: ResetQuitPlan | null;
};

export type ResetWellnessV1 = {
  version: 1;
  onboardingDone: boolean;
  onboardingProfile: ResetOnboardingProfile;
  trackMetrics: ResetTrackMetric[];
  quitPlan: ResetQuitPlan | null;
  goals: WellnessGoal[];
  measurements: MeasurementEntry[];
  weighIns: WeighInEntry[];
  /** Which week template row to highlight (0–3), cycles visually */
  trainingWeekIndex: number;
};

export function defaultResetOnboardingProfile(): ResetOnboardingProfile {
  return {
    primaryGoal: "wellbeing",
    profileType: "mixed",
    baselineMood: "steady",
    trackMetrics: ["mood"],
    checkInFrequency: "daily",
    quitPlan: null,
  };
}

export function defaultWellnessState(): ResetWellnessV1 {
  const onboardingProfile = defaultResetOnboardingProfile();
  return {
    version: 1,
    onboardingDone: false,
    onboardingProfile,
    trackMetrics: onboardingProfile.trackMetrics,
    quitPlan: onboardingProfile.quitPlan,
    goals: [],
    measurements: [],
    weighIns: [],
    trainingWeekIndex: 0,
  };
}

function safeParse(raw: string | null): ResetWellnessV1 | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<ResetWellnessV1>;
    if (data.version !== 1 || !Array.isArray(data.goals)) return null;
    const defaults = defaultResetOnboardingProfile();
    const onboardingProfile = {
      primaryGoal: data.onboardingProfile?.primaryGoal ?? defaults.primaryGoal,
      profileType: data.onboardingProfile?.profileType ?? defaults.profileType,
      baselineMood: data.onboardingProfile?.baselineMood ?? defaults.baselineMood,
      trackMetrics: Array.isArray(data.onboardingProfile?.trackMetrics)
        ? data.onboardingProfile.trackMetrics
        : Array.isArray(data.trackMetrics)
          ? data.trackMetrics
          : defaults.trackMetrics,
      checkInFrequency: data.onboardingProfile?.checkInFrequency ?? defaults.checkInFrequency,
      quitPlan: data.onboardingProfile?.quitPlan ?? data.quitPlan ?? defaults.quitPlan,
    } satisfies ResetOnboardingProfile;

    return {
      version: 1,
      onboardingDone: Boolean(data.onboardingDone),
      onboardingProfile,
      trackMetrics: onboardingProfile.trackMetrics,
      quitPlan: onboardingProfile.quitPlan,
      goals: data.goals as WellnessGoal[],
      measurements: Array.isArray(data.measurements) ? data.measurements : [],
      weighIns: Array.isArray(data.weighIns) ? data.weighIns : [],
      trainingWeekIndex:
        typeof data.trainingWeekIndex === "number" ? data.trainingWeekIndex % 4 : 0,
    };
  } catch {
    return null;
  }
}

export function loadWellnessState(): ResetWellnessV1 {
  if (typeof window === "undefined") return defaultWellnessState();
  try {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
    return parsed ?? defaultWellnessState();
  } catch {
    return defaultWellnessState();
  }
}

export function saveWellnessState(next: ResetWellnessV1): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function quitGoals(goals: WellnessGoal[]): QuitGoal[] {
  return goals.filter((g): g is QuitGoal => g.kind === "quit");
}

export function bodyGoals(goals: WellnessGoal[]): BodyGoal[] {
  return goals.filter((g): g is BodyGoal => g.kind === "body");
}

export function hasTrainingRelevantBodyGoal(goals: WellnessGoal[]): boolean {
  return bodyGoals(goals).some((g) => g.mode === "bulk" || g.mode === "lean");
}

export function hasWeightLossGoal(goals: WellnessGoal[]): boolean {
  return bodyGoals(goals).some((g) => g.mode === "weight_loss");
}

/** Sorted ascending by date for charts */
export function sortedWeighIns(entries: WeighInEntry[]): WeighInEntry[] {
  return [...entries].sort((a, b) => a.at.localeCompare(b.at));
}
