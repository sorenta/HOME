"use client";

import Link from "next/link";
import { useState } from "react";
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
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const supabaseReady = getBrowserClient() !== null;

  async function onForgotPassword() {
    const supabase = getBrowserClient();
    if (!supabase) {
      setError(t("supabase.missing"));
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError(t("auth.forgot.emailRequired"));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth`
          : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo },
      );

      if (resetError) throw resetError;
      setMessage(t("auth.forgot.success"));
      hapticTap();
    } catch (err) {
      const nextError =
        err instanceof Error ? err.message : t("auth.error.generic");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <AppMark size="md" />
        </div>
        <h1 className="maj-auth-heading mt-6 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {locale === "lv"
            ? "Miers mājās sākas šeit."
            : "Peace at home starts here."}
        </h1>
        <p className="mt-2 text-sm font-medium text-foreground/70 max-w-sm mx-auto">
          {locale === "lv"
            ? "Esmu H:O – jūsu digitālais asistents. Sakārtosim ikdienu kopā, lai ģimenei paliek laiks atpūtai."
            : "I'm H:O – your digital assistant. Let's organize the daily routine together, so the family has time to relax."}
        </p>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <label className="block text-sm text-(--color-text-secondary)">
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

        <label className="block text-sm text-(--color-text-secondary)">
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

        <label className="block text-sm text-(--color-text-secondary)">
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

        <div className="-mt-1 text-right">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => {
                void onForgotPassword();
              }}
              disabled={loading}
              className="text-xs font-medium text-(--color-accent) underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("auth.forgot.link")}
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-2xl border border-[color-mix(in_srgb,var(--color-danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-3 py-2 text-sm text-(--color-danger)">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-2xl border border-[color-mix(in_srgb,var(--color-success)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] px-3 py-2 text-sm text-(--color-success)">
            {message}
          </p>
        ) : null}

        {mode === "signup" ? (
          <label className="flex cursor-pointer items-start gap-2 text-left text-xs leading-relaxed text-(--color-text-secondary)">
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
                className="font-semibold text-(--color-accent) underline"
              >
                {t("legal.privacy.title")}
              </Link>
              {t("auth.privacy.agreeSuffix")}
            </span>
          </label>
        ) : (
          <p className="text-center text-xs text-(--color-text-muted)">
            <Link href="/legal/privacy" className="underline">
              {t("legal.privacy.title")}
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || (mode === "signup" && !acceptPrivacy)}
          className={[
            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity",
            loading || (mode === "signup" && !acceptPrivacy)
              ? "cursor-not-allowed bg-[color-mix(in_srgb,var(--color-text-muted)_28%,var(--color-surface))] text-(--color-text-muted) opacity-80"
              : "maj-auth-primary-button",
          ].join(" ")}
        >
          {loading
            ? t("auth.loading")
            : mode === "signin"
              ? t("auth.signin.submit")
              : t("auth.signup.submit")}
        </button>

        {!supabaseReady ? (
          <p className="text-center text-xs text-(--color-danger)">
            {t("supabase.missing")}
          </p>
        ) : null}

        <div className="mt-6 text-center text-sm text-(--color-text-secondary)">
          {mode === "signup" ? (
            <p>
              {locale === "lv" ? "Tev jau ir konts? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setMessage(null);
                }}
                className="font-bold text-primary underline-offset-2 hover:underline"
              >
                {locale === "lv" ? "Ienāc šeit" : "Sign in here"}
              </button>
            </p>
          ) : (
            <p>
              {locale === "lv" ? "Nav vēl konta? " : "Don't have an account yet? "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setMessage(null);
                  setAcceptPrivacy(false);
                }}
                className="font-bold text-primary underline-offset-2 hover:underline"
              >
                {locale === "lv" ? "Reģistrējies šeit" : "Sign up here"}
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
