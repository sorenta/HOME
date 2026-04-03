"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { hapticTap } from "@/lib/haptic";
import { AppMark } from "@/components/branding/app-mark";
import { useI18n } from "@/lib/i18n/i18n-context";
import { recordPrivacyPolicyAcceptance } from "@/lib/legal/record-consent";

type Mode = "signin" | "signup";

type Props = {
  compact?: boolean;
};

export function AuthScreen({ compact = false }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const supabaseReady = useMemo(() => getBrowserClient() !== null, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = getBrowserClient();

    if (!supabase) {
      setError(t("supabase.missing"));
      return;
    }

    if (mode === "signup" && !acceptPrivacy) {
      setError(t("auth.privacy.mustAccept"));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name.trim(),
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session?.user?.id) {
          await recordPrivacyPolicyAcceptance(data.session.user.id);
        }

        setMessage(
          data.session
            ? t("auth.signup.success")
            : t("auth.signup.confirmation"),
        );

        const nextUserId = data.session?.user?.id ?? data.user?.id ?? null;

        if (nextUserId && typeof window !== "undefined") {
          const seenKey = `majapps-auth-welcome-seen-${nextUserId}`;
          if (!window.localStorage.getItem(seenKey)) {
            window.localStorage.setItem(
              `majapps-auth-welcome-pending-${nextUserId}`,
              "true",
            );
          }
          window.location.assign("/");
          return;
        }
      } else {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setMessage(t("auth.signin.success"));

        const nextUserId = data.user?.id ?? data.session?.user?.id ?? null;

        if (nextUserId && typeof window !== "undefined") {
          const seenKey = `majapps-auth-welcome-seen-${nextUserId}`;
          if (!window.localStorage.getItem(seenKey)) {
            window.localStorage.setItem(
              `majapps-auth-welcome-pending-${nextUserId}`,
              "true",
            );
          }
          window.location.assign("/");
          return;
        }
      }

      setPassword("");
      hapticTap();
    } catch (err) {
      const nextError =
        err instanceof Error ? err.message : t("auth.error.generic");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={[
        "maj-auth-card w-full rounded-3xl p-5 backdrop-blur-sm",
        compact ? "" : "mx-auto max-w-md",
      ].join(" ")}
    >
      <div className="mb-5 text-center">
        <div className="flex justify-center">
          <AppMark size="md" />
        </div>
        <h1 className="maj-auth-heading mt-2 text-3xl font-semibold">
          {mode === "signin" ? t("auth.signin.title") : t("auth.signup.title")}
        </h1>
        <p className="maj-auth-subheading mt-2 text-sm leading-relaxed">
          {mode === "signin" ? t("auth.signin.subtitle") : t("auth.signup.subtitle")}
        </p>
      </div>

      <div className="maj-auth-segmented mb-4 grid grid-cols-2 gap-2 rounded-2xl p-1">
        {(["signin", "signup"] as const).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => {
              setMode(nextMode);
              setError(null);
              setMessage(null);
              if (nextMode === "signin") {
                setAcceptPrivacy(false);
              }
            }}
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              mode === nextMode
                ? "maj-auth-segmented-active"
                : "maj-auth-segmented-idle",
            ].join(" ")}
          >
            {nextMode === "signin" ? t("auth.tabs.signin") : t("auth.tabs.signup")}
          </button>
        ))}
      </div>

      {mode === "signup" ? (
        <p className="mb-4 text-center text-xs italic text-[color:var(--color-text-muted)]">
          {t("auth.signup.hint")}
        </p>
      ) : null}

      <form className="space-y-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <label className="block text-sm text-[color:var(--color-text-secondary)]">
            {t("auth.field.name")}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="maj-auth-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
              autoComplete="name"
              required
            />
          </label>
        ) : null}

        <label className="block text-sm text-[color:var(--color-text-secondary)]">
          {t("auth.field.email")}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="maj-auth-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
            autoComplete="email"
            required
          />
        </label>

        <label className="block text-sm text-[color:var(--color-text-secondary)]">
          {t("auth.field.password")}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="maj-auth-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </label>

        {error ? (
          <p className="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-danger)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-success)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--color-success)_12%,transparent)] px-3 py-2 text-sm text-[color:var(--color-success)]">
            {message}
          </p>
        ) : null}

        {mode === "signup" ? (
          <label className="flex cursor-pointer items-start gap-2 text-left text-xs leading-relaxed text-[color:var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span>
              {t("auth.privacy.agreePrefix")}{" "}
              <Link
                href="/legal/privacy"
                className="font-semibold text-[color:var(--color-accent)] underline"
              >
                {t("legal.privacy.title")}
              </Link>
              {t("auth.privacy.agreeSuffix")}
            </span>
          </label>
        ) : (
          <p className="text-center text-xs text-[color:var(--color-text-muted)]">
            <Link href="/legal/privacy" className="underline">
              {t("legal.privacy.title")}
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !supabaseReady || (mode === "signup" && !acceptPrivacy)}
          className={[
            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity",
            loading || !supabaseReady || (mode === "signup" && !acceptPrivacy)
              ? "cursor-not-allowed bg-[color:color-mix(in_srgb,var(--color-text-muted)_28%,var(--color-surface))] text-[color:var(--color-text-muted)] opacity-80"
              : "maj-auth-primary-button",
          ].join(" ")}
        >
          {loading
            ? t("auth.loading")
            : mode === "signin"
              ? t("auth.signin.submit")
              : t("auth.signup.submit")}
        </button>
      </form>
    </div>
  );
}
