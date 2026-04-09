import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getGoogleFitOauthClientId,
  getSupabasePublicEnv,
} from "@/lib/supabase/env";

const FITNESS_SCOPE =
  "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read";

export async function GET(request: NextRequest) {
  const clientId = getGoogleFitOauthClientId();
  if (!clientId) {
    return NextResponse.json(
      { error: "missing_client_id", hint: "Set GOOGLE_FIT_OAUTH_CLIENT_ID" },
      { status: 501 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!accessToken) {
    return NextResponse.json({ error: "missing_auth" }, { status: 401 });
  }

  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    return NextResponse.json({ error: "missing_supabase_env" }, { status: 500 });
  }

  const supabase = createClient(supabaseEnv.url, supabaseEnv.publishableKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 401 });
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/integrations/google-fit/callback`;
  const stateNonce = crypto.randomUUID();

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", FITNESS_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", stateNonce);

  const mode = request.nextUrl.searchParams.get("mode");
  const response =
    mode === "json"
      ? NextResponse.json({ url: url.toString() })
      : NextResponse.redirect(url.toString());

  response.cookies.set({
    name: "google_fit_auth",
    value: JSON.stringify({
      state: stateNonce,
      accessToken,
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
