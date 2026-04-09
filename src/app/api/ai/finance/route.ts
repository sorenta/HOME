import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServerEnv } from "@/lib/supabase/env";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

type TransactionRow = {
  type: string;
  amount: number;
  label?: string;
  category?: string | null;
  date?: string | null;
};

type FixedCostRow = {
  label: string;
  amount: number;
  due_day?: number | null;
};

type Body = {
  locale?: string;
  prompt?: string;
  transactions?: TransactionRow[];
  fixedCosts?: FixedCostRow[];
  balance?: number;
};

function parsePayload(raw: string) {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  return {
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    tips: Array.isArray(parsed.tips)
      ? parsed.tips.filter((x): x is string => typeof x === "string")
      : [],
    warnings: Array.isArray(parsed.warnings)
      ? parsed.warnings.filter((x): x is string => typeof x === "string")
      : [],
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
      temperature: 0.4,
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
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
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

    if (!checkRateLimit(`finance:${user.id}`, 5, 60000)) {
      console.warn(`[RateLimit] Finance AI usage exceeded by user: ${user.id}`);
      return NextResponse.json(
        { ok: false, code: "RATE_LIMITED", message: "Too many AI requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as Body;
    // Reuse user BYOK key
    const { data: cred, error: credErr } = await supabase
      .from("user_kitchen_ai")
      .select("provider, vault_secret_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (credErr?.code === "PGRST205") {
      return NextResponse.json({ ok: false, code: "SCHEMA_MISSING" }, { status: 500 });
    }

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

    const locale = body.locale === "en" ? "en" : "lv";
    const txns = body.transactions ?? [];
    const fixed = body.fixedCosts ?? [];
    const userPrompt = (body.prompt ?? "").trim();

    const system =
      locale === "lv"
        ? `Tu esi HOME:OS finanšu padomdevējs. Atbildi TIKAI ar derīgu JSON (bez markdown):
{"reply":"draudzīgs teksts latviski","tips":["padoms1","padoms2"],"warnings":["brīdinājums1"]}
"tips" — 1–3 padomi kā optimizēt izdevumus vai ietaupīt.
"warnings" — brīdinājumi par potenciālām problēmām (parādi, kavējumi utml.).
Neizgudro datus. Balstīs tikai uz sniegto informāciju.`
        : `You are the HOME:OS finance advisor. Reply ONLY with valid JSON (no markdown):
{"reply":"friendly text in English","tips":["tip1","tip2"],"warnings":["warning1"]}
"tips" — 1–3 money-saving or spending optimization suggestions.
"warnings" — risk flags (debts, missed payments, etc.).
Do not invent data. Use only the provided information.`;

    const txnLines = txns
      .map((r) => `- ${r.type}: €${r.amount.toFixed(2)} ${r.label ?? ""}${r.category ? ` [${r.category}]` : ""}${r.date ? ` (${r.date})` : ""}`)
      .join("\n");
    const fixedLines = fixed
      .map((r) => `- ${r.label}: €${r.amount.toFixed(2)}${r.due_day ? ` (due day ${r.due_day})` : ""}`)
      .join("\n");

    const userBlock = [
      `Balance: €${(body.balance ?? 0).toFixed(2)}`,
      `Transactions:\n${txnLines || "(none)"}`,
      `Fixed costs:\n${fixedLines || "(none)"}`,
      userPrompt ? `User question:\n${userPrompt}` : "Task: Analyze spending and suggest improvements.",
    ].join("\n\n");

    const result =
      cred.provider === "gemini"
        ? await callGemini(apiKey, system, userBlock)
        : await callOpenAI(apiKey, system, userBlock);

    if (!result.ok) {
      return NextResponse.json({ ok: false, code: "LLM_ERROR", message: result.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true, ...result.payload });
  } catch (e) {
    console.error("POST /api/ai/finance", e);
    return NextResponse.json({ ok: false, code: "INTERNAL" }, { status: 500 });
  }
}
