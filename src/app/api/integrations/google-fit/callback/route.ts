import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth atgriešanās punkts. Pilnai soļu sinhronizācijai vēl jāapmaina `code` pret tokeniem
 * serverī un jāsaglabā Supabase (piem. `user_health_tokens`) ar lietotāja sesiju.
 */
export function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const err = request.nextUrl.searchParams.get("error");

  if (err) {
    return NextResponse.redirect(
      new URL(`/reset?fit=error&message=${encodeURIComponent(err)}`, request.nextUrl.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/reset?fit=error", request.nextUrl.origin));
  }

  return NextResponse.redirect(new URL("/reset?fit=connected", request.nextUrl.origin));
}
