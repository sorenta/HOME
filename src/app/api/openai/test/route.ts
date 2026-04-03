import { NextResponse } from "next/server";
import { testOpenAiConnection } from "@/lib/openai";

export async function GET() {
  try {
    const result = await testOpenAiConnection();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown OpenAI error",
      },
      { status: 500 },
    );
  }
}
