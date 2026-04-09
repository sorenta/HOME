"use client";

import { useEffect } from "react";
import { PwaInstallPrompt } from "./pwa-install-prompt";

export function PwaProvider() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      const cleanupDevWorkers = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));

          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
        } catch (error) {
          console.error("Failed to cleanup service workers in development", error);
        }
      };

      void cleanupDevWorkers();
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
