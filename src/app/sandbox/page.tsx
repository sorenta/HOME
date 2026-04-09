"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AppMark } from "@/components/branding/app-mark";
import { AppSectionIcon, ThemeToolbarIcon, THEME_ICON_META, type AppSectionId } from "@/components/icons";
import {
  MAJAPPS_THEME_STORAGE_KEY,
  useTheme,
} from "@/components/providers/theme-provider";
import type { ThemeId } from "@/lib/theme-logic";
import styles from "./sandbox.module.css";

type SandboxViewId =
  | "dashboard"
  | "events"
  | "kitchen"
  | "finance"
  | "pharmacy"
  | "reset"
  | "settings";

type SandboxView = {
  id: SandboxViewId;
  label: string;
  href: string;
  sectionId: AppSectionId;
};

const VIEWS: SandboxView[] = [
  { id: "dashboard", label: "Sākums", href: "/", sectionId: "home" },
  { id: "events", label: "Kalendārs", href: "/events", sectionId: "calendar" },
  { id: "kitchen", label: "Virtuve", href: "/kitchen", sectionId: "kitchen" },
  { id: "finance", label: "Finanses", href: "/finance", sectionId: "finance" },
  { id: "pharmacy", label: "Aptieciņa", href: "/pharmacy", sectionId: "pharmacy" },
  { id: "reset", label: "RESET", href: "/reset", sectionId: "reset" },
  { id: "settings", label: "Iestatījumi", href: "/settings", sectionId: "settings" },
];

function viewFromPath(pathname: string): SandboxViewId {
  if (pathname === "/" || pathname === "") return "dashboard";
  if (pathname.startsWith("/events") || pathname.startsWith("/calendar")) return "events";
  if (pathname.startsWith("/kitchen")) return "kitchen";
  if (pathname.startsWith("/finance")) return "finance";
  if (pathname.startsWith("/pharmacy")) return "pharmacy";
  if (pathname.startsWith("/reset")) return "reset";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
}

export default function SandboxPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { themeId, setThemeId } = useTheme();
  const [activeView, setActiveView] = useState<SandboxViewId>("dashboard");
  const [frameVersion, setFrameVersion] = useState(0);

  const activeViewMeta = useMemo(
    () => VIEWS.find((view) => view.id === activeView) ?? VIEWS[0],
    [activeView],
  );

  const frameSrc = activeViewMeta.href;

  function reloadFrame() {
    setFrameVersion((value) => value + 1);
  }

  function handleViewChange(viewId: SandboxViewId) {
    setActiveView(viewId);
  }

  function handleThemeChange(nextTheme: ThemeId) {
    setThemeId(nextTheme);
    try {
      window.localStorage.setItem(MAJAPPS_THEME_STORAGE_KEY, nextTheme);
    } catch {
      // ignore localStorage failures in sandbox
    }
    reloadFrame();
  }

  function handleFrameLoad() {
    try {
      const pathname = iframeRef.current?.contentWindow?.location.pathname ?? "/";
      setActiveView(viewFromPath(pathname));
    } catch {
      // ignore same-origin access errors if browser blocks temporarily during navigation
    }
  }

  return (
    <main className={styles.page}>
      <aside className={styles.dock} aria-label="Real app sandbox controls">
        <div className={styles.dockTop}>
          <AppMark size="sm" />
          <div className={styles.dockCopy}>
            <p className={styles.kicker}>Real-App Sandbox</p>
            <h1 className={styles.title}>Dzīvais H:O preview</h1>
            <p className={styles.body}>
              Īstās lapas, īstie motīvi un īstais navigācijas karkass vienā vietā.
            </p>
          </div>
        </div>

        <section className={styles.controlSection}>
          <p className={styles.sectionLabel}>Skats</p>
          <div className={styles.viewList}>
            {VIEWS.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => handleViewChange(view.id)}
                className={`${styles.viewButton} ${activeView === view.id ? styles.viewButtonActive : ""}`}
              >
                <span className={styles.viewButtonIcon} aria-hidden>
                  <AppSectionIcon
                    sectionId={view.sectionId}
                    themeId={themeId}
                    size={18}
                    tone={activeView === view.id ? "active" : "inactive"}
                  />
                </span>
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.controlSection}>
          <p className={styles.sectionLabel}>Motīvs</p>
          <div className={styles.themeList}>
            {(Object.keys(THEME_ICON_META) as ThemeId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeChange(id)}
                className={`${styles.themeButton} ${themeId === id ? styles.themeButtonActive : ""}`}
                aria-label={THEME_ICON_META[id].name}
                title={THEME_ICON_META[id].name}
              >
                <ThemeToolbarIcon
                  themeId={id}
                  size={22}
                  tone={themeId === id ? "active" : "inactive"}
                />
                <span>{THEME_ICON_META[id].name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.controlSection}>
          <p className={styles.sectionLabel}>Darbības</p>
          <div className={styles.utilityRow}>
            <button type="button" onClick={() => reloadFrame()} className={styles.utilityButton}>
              Pārlādēt
            </button>
            <Link href={activeViewMeta.href} target="_blank" className={styles.utilityButton}>
              Atvērt lapu
            </Link>
          </div>
        </section>
      </aside>

      <section className={styles.stage}>
        <div className={styles.stageHeader}>
          <div>
            <p className={styles.kicker}>Dzīvais maršruts</p>
            <h2 className={styles.stageTitle}>{activeViewMeta.label}</h2>
          </div>
          <code className={styles.routePill}>{activeViewMeta.href}</code>
        </div>

        <div className={styles.previewShell}>
          <iframe
            key={`${activeView}:${themeId}:${frameVersion}`}
            ref={iframeRef}
            src={frameSrc}
            title="H:O real app preview"
            onLoad={handleFrameLoad}
            className={styles.iframe}
          />
        </div>
      </section>
    </main>
  );
}
