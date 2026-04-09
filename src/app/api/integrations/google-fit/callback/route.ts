import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getGoogleFitOauthEnv,
  getSupabasePublicEnv,
} from "@/lib/supabase/env";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

/**
 * Google Fit OAuth callback.
 * Exchanges the authorization code for tokens and stores them in
 * public.user_google_fit_tokens tied to the authenticated Supabase user.
 * Session binding is validated via nonce state + httpOnly cookie set by /authorize.
 *
 * Prerequisites:
 * - Run supabase/google_fit_tokens.sql migration.
 * - Set GOOGLE_FIT_OAUTH_CLIENT_ID and GOOGLE_FIT_OAUTH_CLIENT_SECRET env vars.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const err = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");
  const origin = request.nextUrl.origin;

  const redirectWithCookieClear = (path: string) => {
    const response = NextResponse.redirect(new URL(path, origin));
    response.cookies.delete("google_fit_auth");
    return response;
  };

  if (err) {
    return redirectWithCookieClear(`/reset?fit=error&message=${encodeURIComponent(err)}`);
  }

  if (!code) {
    return redirectWithCookieClear("/reset?fit=error&reason=no_code");
  }

  const oauthEnv = getGoogleFitOauthEnv();
  const clientId = oauthEnv?.clientId ?? null;
  const clientSecret = oauthEnv?.clientSecret ?? null;
  const redirectUri = `${origin}/api/integrations/google-fit/callback`;
  const authCookie = request.cookies.get("google_fit_auth")?.value ?? "";

  let accessToken: string | null = null;
  try {
    if (authCookie) {
      const parsed = JSON.parse(authCookie) as { state?: string; accessToken?: string };
      if (state && parsed.state === state && typeof parsed.accessToken === "string") {
        accessToken = parsed.accessToken;
      }
    }
  } catch {
    accessToken = null;
  }

  if (!accessToken) {
    return redirectWithCookieClear("/reset?fit=error&reason=state_mismatch");
  }

  // Exchange code for tokens
  if (clientId && clientSecret) {
    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
        cache: "no-store",
      });

      const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

      if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
        const reason = tokenData.error_description ?? tokenData.error ?? "token_exchange_failed";
        return redirectWithCookieClear(`/reset?fit=error&reason=${encodeURIComponent(reason)}`);
      }

      const supabaseEnv = getSupabasePublicEnv();
      if (!supabaseEnv) {
        return redirectWithCookieClear("/reset?fit=error&reason=missing_supabase_env");
      }

      const supabase = createClient(supabaseEnv.url, supabaseEnv.publishableKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        return redirectWithCookieClear("/reset?fit=error&reason=invalid_session");
      }

      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null;

      const { error: upsertErr } = await supabase
        .from("user_google_fit_tokens")
        .upsert(
          {
            user_id: user.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token ?? null,
            token_type: tokenData.token_type ?? "Bearer",
            expires_at: expiresAt,
            scope: tokenData.scope ?? null,
          },
          { onConflict: "user_id" },
        );

      if (upsertErr) {
        return redirectWithCookieClear("/reset?fit=error&reason=storage_failed");
      }

      return redirectWithCookieClear("/reset?fit=connected");
    } catch {
      return redirectWithCookieClear("/reset?fit=error&reason=network");
    }
  }

  // client_secret not configured — redirect with partial connection notice
  return redirectWithCookieClear("/reset?fit=error&reason=missing_client_secret");
}
