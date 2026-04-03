import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SignalRow = {
  label: string;
  value: number;
};

type Body = {
  householdId?: string;
  locale?: string;
  prompt?: string;
  mood?: string | null;
  moodScore?: number | null;
  signals?: SignalRow[];
  quitDays?: number | null;
  goals?: string[];
};

function parsePayload(raw: string) {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  return {
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((x): x is string => typeof x === "string")
      : [],
    encouragement: typeof parsed.encouragement === "string" ? parsed.encouragement : "",
  };
}

async function callOpenAI(apiKey: string, system: string, user: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false as const, message: err.slice(0, 200) };
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { ok: false as const, message: "Empty model response." };

  try {
    return { ok: true as const, payload: parsePayload(content) };
  } catch {
    return { ok: false as const, message: "Could not parse model JSON." };
  }
}

async function callGemini(apiKey: string, system: string, user: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `${system}\n\n---\n\n${user}` }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false as const, message: err.slice(0, 200) };
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return { ok: false as const, message: "Empty Gemini response." };

  try {
    return { ok: true as const, payload: parsePayload(text) };
  } catch {
    return { ok: false as const, message: "Could not parse Gemini JSON." };
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    if (!token) {
      return NextResponse.json({ ok: false, code: "NO_AUTH" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return NextResponse.json({ ok: false, code: "NO_SUPABASE_ENV" }, { status: 500 });
    }

    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, code: "NO_AUTH" }, { status: 401 });
    }

    const body = (await request.json()) as Body;
    const householdId = body.householdId?.trim();
    if (!householdId) {
      return NextResponse.json({ ok: false, code: "NO_HOUSEHOLD" }, { status: 400 });
    }

    const { data: member } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("household_id", householdId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ ok: false, code: "NOT_MEMBER" }, { status: 403 });
    }

    // Reuse kitchen AI key
    const { data: cred } = await supabase
      .from("household_kitchen_ai")
      .select("provider, api_key")
      .eq("household_id", householdId)
      .maybeSingle();

    if (!cred?.api_key) {
      return NextResponse.json({ ok: false, code: "NO_HOUSEHOLD_AI" }, { status: 400 });
    }

    const locale = body.locale === "en" ? "en" : "lv";
    const userPrompt = (body.prompt ?? "").trim();

    const system =
      locale === "lv"
        ? `Tu esi HOME:OS labsajūtas padomdevējs. Esi empātisks un atbalstošs. Atbildi TIKAI ar derīgu JSON (bez markdown):
{"reply":"draudzīgs, empātisks teksts latviski","suggestions":["padoms1","padoms2"],"encouragement":"motivējošs teikums"}
"suggestions" — 1–3 praktiski padomi labsajūtas uzlabošanai, balstoties uz datiem.
"encouragement" — viens personalizēts uzmundrinošs teikums.
Nedrīkst dot medicīniskus padomus. Fokusējies uz ikdienas labsajūtu un paradumiem.`
        : `You are the HOME:OS wellness advisor. Be empathetic and supportive. Reply ONLY with valid JSON (no markdown):
{"reply":"friendly empathetic text","suggestions":["tip1","tip2"],"encouragement":"motivating sentence"}
"suggestions" — 1–3 practical wellness improvement tips based on the data.
"encouragement" — one personalized motivating sentence.
Never give medical advice. Focus on daily wellness habits.`;

    const signalLines = (body.signals ?? [])
      .map((s) => `- ${s.label}: ${s.value}/10`)
      .join("\n");

    const userBlock = [
      body.mood ? `Current mood: ${body.mood} (score: ${body.moodScore ?? "?"}/100)` : "",
      signalLines ? `Daily signals:\n${signalLines}` : "",
      body.quitDays != null ? `Quit streak: ${body.quitDays} days` : "",
      body.goals?.length ? `Goals: ${body.goals.join(", ")}` : "",
      userPrompt ? `User question:\n${userPrompt}` : "Task: Analyze wellness data and give gentle advice.",
    ].filter(Boolean).join("\n\n");

    const result =
      cred.provider === "gemini"
        ? await callGemini(cred.api_key, system, userBlock)
        : await callOpenAI(cred.api_key, system, userBlock);

    if (!result.ok) {
      return NextResponse.json({ ok: false, code: "LLM_ERROR", message: result.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true, ...result.payload });
  } catch (e) {
    console.error("POST /api/ai/reset", e);
    return NextResponse.json({ ok: false, code: "INTERNAL" }, { status: 500 });
  }
}
