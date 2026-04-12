"use client";

import { useEffect, useMemo, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari specific property
    window.navigator.standalone === true
  );
}

function detectIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
  return isIos && isSafari;
}

export function PwaInstallPrompt() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(isStandalone());
  }, [mounted]);

  useEffect(() => {
    if (installed) {
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [installed]);

  const iosBannerVisible = mounted ? detectIosSafari() : false;

  const mode = useMemo(() => {
    if (!mounted || installed || dismissed) return "hidden";
    if (installEvent) return "prompt";
    if (iosBannerVisible) return "ios";
    return "hidden";
  }, [dismissed, installEvent, installed, iosBannerVisible, mounted]);

  async function handleInstall() {
    if (!installEvent) return;
    hapticTap();
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  }

  if (mode === "hidden") return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-(--color-surface-border) bg-(--color-surface)/95 p-4 shadow-lg backdrop-blur-md">
      <p className="text-sm font-semibold text-(--color-text)">
        {t("pwa.title")}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-(--color-secondary)">
        {mode === "prompt" ? t("pwa.prompt.body") : t("pwa.ios.body")}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {mode === "prompt" ? (
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background"
          >
            {t("pwa.install")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-xl border border-(--color-surface-border) px-4 py-2 text-sm font-medium text-(--color-text)"
        >
          {t("pwa.dismiss")}
        </button>
      </div>
    </div>
  );
}
