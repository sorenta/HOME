import { NextResponse } from "next/server";
import { getGoogleFitOauthClientId } from "@/lib/supabase/env";

export function GET() {
  const id = getGoogleFitOauthClientId();
  return NextResponse.json({ authorizeAvailable: Boolean(id?.trim()) });
}
