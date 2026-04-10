import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServerEnv } from "@/lib/supabase/env";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

type InventoryRow = {
  name: string;
  category?: string | null;
  quantity?: number;
  unit?: string | null;
  expiry_date?: string | null;
};

type ShoppingRow = {
  title: string;
  status?: string;
};

type Body = {
  locale?: string;
  prompt?: string;
  inventory?: InventoryRow[];
  shopping?: ShoppingRow[];
};

function parseAssistantPayload(raw: string): {
  reply: string;
  missing_for_cart: string[];
  meal_ideas: string[];
} {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  const parsed = JSON.parse(text) as Record<string, unknown>;
  const reply = typeof parsed.reply === "string" ? parsed.reply : "";
  const missing = Array.isArray(parsed.missing_for_cart)
    ? parsed.missing_for_cart.filter((x): x is string => typeof x === "string")
    : [];
  const ideas = Array.isArray(parsed.meal_ideas)
    ? parsed.meal_ideas.filter((x): x is string => typeof x === "string")
    : [];

  return { reply, missing_for_cart: missing, meal_ideas: ideas };
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
      temperature: 0.55,
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
    return { ok: true as const, payload: parseAssistantPayload(content) };
  } catch {
    return { ok: false as const, message: "Could not parse model JSON." };
  }
}

async function getGeminiModelCandidates(apiKey: string): Promise<string[]> {
  const preferred = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-1.5-flash-latest"];
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(listUrl, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      return preferred;
    }

    const payload = (await res.json()) as {
      models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
    };

    const available = (payload.models ?? [])
      .filter((m) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
      .map((m) => (m.name ?? "").replace(/^models\//, ""))
      .filter(Boolean);

    if (available.length === 0) {
      return preferred;
    }

    const ordered = [
      ...preferred.filter((model) => available.includes(model)),
      ...available.filter((model) => !preferred.includes(model)),
    ];

    return ordered;
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
        contents: [
          {
            role: "user",
            parts: [{ text: `${system}\n\nLietotāja dati un jautājums:\n${user}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.55,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Gemini Error]", model, res.status, errText);

      let msg = `AI Error (${res.status})`;
      try {
        const errJson = JSON.parse(errText) as { error?: { message?: string } };
        msg = errJson.error?.message || msg;
      } catch {
        // ignore invalid error JSON
      }

      lastErrorMessage = msg;

      const msgLower = msg.toLowerCase();
      const modelMissing =
        msgLower.includes("is not found") ||
        msgLower.includes("not supported for generatecontent") ||
        msgLower.includes("no longer available to new users") ||
        msgLower.includes("deprecated");
      if (modelMissing) {
        continue;
      }

      return { ok: false as const, message: msg.slice(0, 300) };
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { ok: false as const, message: "Empty Gemini response." };

    try {
      return { ok: true as const, payload: parseAssistantPayload(text) };
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
      return NextResponse.json(
        { 
          ok: false, 
          code: "NO_SUPABASE_ENV", 
          message: "Server environment misconfigured (Service Role Key missing)." 
        }, 
        { status: 500 }
      );
    }

    // Lietotāja klients: auth + user-scoped BYOK metadatu nolasīšanai
    const supabase = createClient(supabaseEnv.url, supabaseEnv.publishableKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Server-side klients: Vault nolasīšanai
    const supabaseAdmin = createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { ok: false, code: "NO_AUTH", message: "User session expired or invalid." }, 
        { status: 401 }
      );
    }

    const body = (await request.json()) as Body;
    const locale = body.locale === "en" ? "en" : "lv";

    if (!checkRateLimit(`kitchen:${user.id}`, 5, 60000)) {
      console.warn(`[RateLimit] Kitchen AI usage exceeded by user: ${user.id}`);
      return NextResponse.json(
        { 
          ok: false, 
          code: "RATE_LIMITED", 
          message: locale === "lv" ? "Pārāk daudz pieprasījumu. Lūdzu, pagaidi minūti." : "Too many AI requests. Please wait a minute." 
        },
        { status: 429 }
      );
    }

    const { data: cred, error: credErr } = await supabase
      .from("user_kitchen_ai")
      .select("provider, vault_secret_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (credErr?.code === "PGRST205") {
      return NextResponse.json(
        { ok: false, code: "SCHEMA_MISSING", message: "Database schema not updated (user_kitchen_ai missing)." }, 
        { status: 500 }
      );
    }

    if (credErr || !cred?.vault_secret_id) {
      return NextResponse.json(
        { 
          ok: false, 
          code: "NO_USER_AI", 
          message: locale === "lv" ? "Tava AI atslēga netika atrasta. Lūdzu, pievieno to Iestatījumos." : "Your AI key was not found. Please add it in Settings." 
        }, 
        { status: 400 }
      );
    }

    const { data: secretValue, error: secretErr } = await supabaseAdmin.rpc("read_vault_secret", {
      secret_id: cred.vault_secret_id,
    });

    if (secretErr) {
      const rpcMissing = secretErr.code === "PGRST202" || `${secretErr.message}`.toLowerCase().includes("function") && `${secretErr.message}`.toLowerCase().includes("not found");
      console.error("[Kitchen AI] Vault read error", {
        userId: user.id,
        vaultId: cred.vault_secret_id,
        error: secretErr.message ?? secretErr,
      });

      if (rpcMissing) {
        return NextResponse.json(
          {
            ok: false,
            code: "VAULT_WRAPPER_MISSING",
            message:
              locale === "lv"
                ? "Serverī trūkst drošās krātuves wrapper funkcijas. Palaiž supabase/vault_wrappers.sql."
                : "Secure storage wrapper function is missing on the server. Run supabase/vault_wrappers.sql.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { ok: false, code: "VAULT_READ_FAILED", message: secretErr.message ?? "Vault read failed" },
        { status: 500 },
      );
    }

    const apiKey = typeof secretValue === "string" ? secretValue.trim() : "";

    if (!apiKey) {
      console.warn("[Kitchen AI] No decrypted secret for user", { userId: user.id, vaultId: cred.vault_secret_id });
      return NextResponse.json(
        { 
          ok: false, 
          code: "NO_USER_AI_SECRET", 
          message: locale === "lv" ? "Neizdevās nolasīt tavu AI atslēgu no drošās krātuves." : "Could not read your AI key from secure storage." 
        }, 
        { status: 500 }
      );
    }

    const inv = body.inventory ?? [];
    const cart = body.shopping ?? [];
    const userPrompt = (body.prompt ?? "").trim();

    const system =
      locale === "lv"
        ? `Tu esi HOME:OS Virtuves maltīšu asistents. Atbildi TIKAI ar derīgu JSON objektu šādā formātā (bez markdown):
{"reply":"īss draudzīgs ievads latviski","missing_for_cart":["produkts1","produkts2"],"meal_ideas":["1. Recepte: Kā to pagatavot (2-3 teikumi).","2. Recepte: ..."]}
"missing_for_cart" — precīzi produktu nosaukumi, kas trūkst vai jānopērk.
"meal_ideas" — 1–3 reālas un īsas, bet pamācošas receptes/idejas no tā, kas jau ir mājās.`
        : `You are the HOME:OS kitchen meal assistant. Reply ONLY with valid JSON (no markdown):
{"reply":"short friendly text in English","missing_for_cart":["item1","item2"],"meal_ideas":["1. Recipe: How to make it (2-3 sentences).","2. Recipe: ..."]}
"missing_for_cart" — product names that are missing or should be bought.
"meal_ideas" — 1–3 short but actionable recipes/instructions using what is already at home.`;

    const invLines = inv
      .map(
        (r) =>
          `- ${r.name}${r.category ? ` [${r.category}]` : ""}: ${r.quantity ?? 1}${r.unit ? ` ${r.unit}` : ""}${r.expiry_date ? `, expiry ${r.expiry_date}` : ""}`,
      )
      .join("\n");

    const cartLines = cart
      .filter((r) => r.status !== "archived")
      .map((r) => `- ${r.title}`)
      .join("\n");

    const userBlock = [
      `Pantry:\n${invLines || "(empty)"}`,
      `Shopping cart:\n${cartLines || "(empty)"}`,
      userPrompt
        ? `User question:\n${userPrompt}`
        : `Task: Suggest what to cook soon and what to add to the cart if needed.`,
    ].join("\n\n");

    const result =
      cred.provider === "gemini"
        ? await callGemini(apiKey, system, userBlock)
        : await callOpenAI(apiKey, system, userBlock);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, code: "LLM_ERROR", message: result.message },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      reply: result.payload.reply,
      missing_for_cart: result.payload.missing_for_cart,
      meal_ideas: result.payload.meal_ideas,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, code: "SERVER", message: msg }, { status: 500 });
  }
}
