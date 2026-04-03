import { NextResponse } from "next/server";
import { testOpenAiConnection } from "@/lib/openai";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await testOpenAiConnection();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OpenAI test request failed.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 400 },
    );
  }
}
