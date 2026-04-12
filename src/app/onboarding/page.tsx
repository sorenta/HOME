"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Ielādējam 3D ainu dinamiski, lai tā nepalielinātu galveno pakotni
const Onboarding3DScene = dynamic(
  () => import("@/components/onboarding/onboarding-3d-scene"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#fafdff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
);

export default function Onboarding3D() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#fafdff" }}>
      <Suspense fallback={null}>
        <Onboarding3DScene />
      </Suspense>
      <div style={{ position: "absolute", top: 40, left: 0, width: "100%", textAlign: "center", fontSize: 28, fontWeight: 700, color: "#3ad", textShadow: "0 2px 8px #fff8" }}>
        Sveiks! Esmu tavs onboarding robotiņš!
      </div>
    </div>
  );
}
