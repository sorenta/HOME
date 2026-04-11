import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServerEnv } from "@/lib/supabase/env";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

type SignalRow = {
  label: string;
  value: number;
};

type Body = {
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
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return {
      reply: typeof parsed.reply === "string" ? parsed.reply : "",
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((x): x is string => typeof x === "string")
        : [],
      encouragement: typeof parsed.encouragement === "string" ? parsed.encouragement : "",
    };
  } catch (e) {
    console.error("Failed to parse Reset AI JSON:", text);
    throw e;
  }
}

async function callVertexAI(system: string, user: string) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  if (!project) {
    return { ok: false as const, message: "Vertex AI project not configured." };
  }

  try {
    const vertexAI = new VertexAI({ project, location });
    const modelName = "gemini-3.1-pro"; 
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: `${system}\n\n---\n\n${user}` }] }],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return { ok: false as const, message: "Empty Vertex AI response." };
    return { ok: true as const, payload: parsePayload(text) };
  } catch (err: any) {
    console.error("Vertex AI Error (Reset):", err);
    return { ok: false as const, message: err.message || "Vertex AI request failed." };
  }
}

async function callOpenAI(apiKey: string, system: string, user: string, provider: string = "openai") {
  let baseUrl = "https://api.openai.com/v1/chat/completions";
  let model = "gpt-4o-mini";

  if (provider === "deepseek") {
    baseUrl = "https://api.deepseek.com/v1/chat/completions";
    model = "deepseek-chat";
  } else if (provider === "grok") {
    baseUrl = "https://api.x.ai/v1/chat/completions";
    model = "grok-1";
  }

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
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

async function getGeminiModelCandidates(apiKey: string): Promise<string[]> {
  const preferred = ["gemini-3.1-pro", "gemini-3.1-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-1.5-flash-latest"];
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(listUrl, { method: "GET", cache: "no-store" });
    if (!res.ok) return preferred;

    const payload = (await res.json()) as {
      models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
    };

    const available = (payload.models ?? [])
      .filter((m) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
      .map((m) => (m.name ?? "").replace(/^models\//, ""))
      .filter(Boolean);

    if (available.length === 0) return preferred;

    return [
      ...preferred.filter((m) => available.includes(m)),
      ...available.filter((m) => !preferred.includes(m)),
    ];
  } catch {
    return preferred;
  }
}

async function callGemini(apiKey: string, system: string, user: string) {
  const modelCandidates = await getGeminiModelCandidates(apiKey);
  let lastErrorMessage = "Gemini request failed.";

  for (const model of modelCandidates) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${system}\n\n---\n\n${user}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let msg = `AI Error (${res.status})`;
      try {
        const errJson = JSON.parse(errText) as { error?: { message?: string } };
        msg = errJson.error?.message || msg;
      } catch {
        // ignore invalid json
      }

      lastErrorMessage = msg;
      const msgLower = msg.toLowerCase();
      const modelIssue =
        msgLower.includes("is not found") ||
        msgLower.includes("not supported for generatecontent") ||
        msgLower.includes("no longer available to new users") ||
        msgLower.includes("deprecated");

      if (modelIssue) continue;
      return { ok: false as const, message: msg.slice(0, 300) };
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

  return { ok: false as const, message: lastErrorMessage.slice(0, 300) };
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    if (!token) {
      return NextResponse.json({ ok: false, code: "NO_AUTH" }, { status: 401 });
    }

    const supabaseEnv = getSupabaseServerEnv();
    if (!supabaseEnv) {
      return NextResponse.json({ ok: false, code: "NO_SUPABASE_ENV" }, { status: 500 });
    }

    const supabase = createClient(supabaseEnv.url, supabaseEnv.publishableKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const supabaseAdmin = createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey);

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, code: "NO_AUTH" }, { status: 401 });
    }

    if (!checkRateLimit(`reset:${user.id}`, 5, 60000)) {
      console.warn(`[RateLimit] Reset AI usage exceeded by user: ${user.id}`);
      return NextResponse.json(
        { ok: false, code: "RATE_LIMITED", message: "Too many AI requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as Body;
    
    // Use Developer Credits (Vertex AI) if configured
    const useDeveloperCredits = !!process.env.GOOGLE_CLOUD_PROJECT;
    
    let result;
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

    if (useDeveloperCredits) {
      console.log(`[AI] Using Vertex AI Developer Credits (Reset) for user: ${user.id}`);
      result = await callVertexAI(system, userBlock);
    } else {
      // User BYOK logic
      const { data: cred, error: credErr } = await supabase
        .from("user_kitchen_ai")
        .select("provider, vault_secret_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (credErr || !cred?.vault_secret_id) {
        return NextResponse.json({ ok: false, code: "NO_USER_AI" }, { status: 400 });
      }

      const { data: secretRow, error: secretErr } = await supabaseAdmin
        .schema("vault")
        .from("decrypted_secrets")
        .select("decrypted_secret")
        .eq("id", cred.vault_secret_id)
        .maybeSingle();

      const apiKey = secretRow?.decrypted_secret?.trim();
      if (secretErr || !apiKey) {
        return NextResponse.json({ ok: false, code: "NO_USER_AI_SECRET" }, { status: 500 });
      }

      result =
        cred.provider === "gemini"
          ? await callGemini(apiKey, system, userBlock)
          : await callOpenAI(apiKey, system, userBlock, cred.provider);
    }

    if (!result.ok) {
      return NextResponse.json({ ok: false, code: "LLM_ERROR", message: result.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true, ...result.payload });
  } catch (e) {
    console.error("POST /api/ai/reset", e);
    return NextResponse.json({ ok: false, code: "INTERNAL" }, { status: 500 });
  }
}

