"use client";

import { useEffect } from "react";
import { PwaInstallPrompt } from "./pwa-install-prompt";

export function PwaProvider() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        console.error("Failed to register service worker", error);
      }
    };

    void register();
  }, []);

  return <PwaInstallPrompt />;
}
