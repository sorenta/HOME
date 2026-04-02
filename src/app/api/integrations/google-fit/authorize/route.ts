import { NextRequest, NextResponse } from "next/server";

const FITNESS_SCOPE =
  "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read";

export function GET(request: NextRequest) {
  const clientId =
    process.env.GOOGLE_FIT_OAUTH_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID;
  if (!clientId?.trim()) {
    return NextResponse.json(
      { error: "missing_client_id", hint: "Set GOOGLE_FIT_OAUTH_CLIENT_ID" },
      { status: 501 },
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/integrations/google-fit/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId.trim());
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", FITNESS_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return NextResponse.redirect(url.toString());
}
