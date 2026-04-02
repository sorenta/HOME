import { NextResponse } from "next/server";

export function GET() {
  const id =
    process.env.GOOGLE_FIT_OAUTH_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID;
  return NextResponse.json({ authorizeAvailable: Boolean(id?.trim()) });
}
