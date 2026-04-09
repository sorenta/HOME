import { NextRequest, NextResponse } from "next/server";
import { type AiProvider, validateProviderKey } from "@/lib/ai/keys";

export const runtime = "nodejs";

type VerifyBody = {
  provider?: AiProvider;
  key?: string;
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    return data.error?.message || data.message || "Verification failed.";
  } catch {
    return "Verification failed.";
  }
}

async function verifyGemini(key: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      ok: false,
      message: await readErrorMessage(response),
    };
  }

  return {
    ok: true,
    message: "Gemini API key verified.",
  };
}

async function verifyOpenAI(key: string) {
  const response = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      message: await readErrorMessage(response),
    };
  }

  return {
    ok: true,
    message: "OpenAI API key verified.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyBody;
    const provider = body.provider;
    const key = body.key?.trim() ?? "";

    if (provider !== "gemini" && provider !== "openai") {
      return NextResponse.json(
        { ok: false, message: "Unsupported provider." },
        { status: 400 },
      );
    }

    const validationError = validateProviderKey(provider, key);
    if (validationError) {
      return NextResponse.json(
        { ok: false, message: validationError },
        { status: 400 },
      );
    }

    const result =
      provider === "gemini" ? await verifyGemini(key) : await verifyOpenAI(key);

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Could not verify API key right now." },
      { status: 500 },
    );
  }
}
