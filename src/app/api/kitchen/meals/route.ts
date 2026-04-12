import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServerEnv } from "@/lib/supabase/env";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { VertexAI } from "@google-cloud/vertexai";

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
  meal_ideas: Array<{ 
    title: string; 
    instructions: string; 
    missing: string[]; 
    source_url?: string;
    cooking_time?: string;
    temperature?: string;
    image_url?: string;
  }>;
} {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const reply = typeof parsed.reply === "string" ? parsed.reply : "";
    const missing = Array.isArray(parsed.missing_for_cart)
      ? parsed.missing_for_cart.filter((x): x is string => typeof x === "string")
      : [];
    
    const ideasRaw = Array.isArray(parsed.meal_ideas) ? parsed.meal_ideas : [];
    const ideas = (ideasRaw as Array<Record<string, unknown>>).map((item) => {
      return {
        title: typeof item.title === "string" ? item.title : (typeof item.recipe === "string" ? item.recipe : ""),
        instructions: typeof item.instructions === "string" ? item.instructions : "",
        missing: Array.isArray(item.missing) ? item.missing.filter((x): x is string => typeof x === "string") : [],
        source_url: typeof item.source_url === "string" ? item.source_url : undefined,
        cooking_time: typeof item.cooking_time === "string" ? item.cooking_time : undefined,
        temperature: typeof item.temperature === "string" ? item.temperature : undefined,
        image_url: typeof item.image_url === "string" ? item.image_url : undefined,
      };
    }).filter(item => item.title || item.instructions);

    return { reply, missing_for_cart: missing, meal_ideas: ideas };
  } catch (e) {
    console.error("Failed to parse Kitchen AI JSON:", text);
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
      generationConfig: { responseMimeType: "application/json", temperature: 0.55 },
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: `${system}\n\nLietotāja dati un jautājums:\n${user}` }] }],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return { ok: false as const, message: "Empty Vertex AI response." };
    return { ok: true as const, payload: parseAssistantPayload(text) };
  } catch (err: unknown) {
    console.error("Vertex AI Error (Kitchen):", err);
    const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Vertex AI request failed.";
    return { ok: false as const, message };
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
      ...preferred.filter((model) => available.includes(model)),
      ...available.filter((model) => !preferred.includes(model)),
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
      let msg = `AI Error (${res.status})`;
      try {
        const errJson = JSON.parse(errText) as { error?: { message?: string } };
        msg = errJson.error?.message || msg;
      } catch {
        // ignore invalid error JSON
      }

      lastErrorMessage = msg;

      const msgLower = msg.toLowerCase();
      const modelIssue =
        res.status === 429 ||
        res.status === 503 ||
        msgLower.includes("overloaded") ||
        msgLower.includes("high demand") ||
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

    // Use Developer Credits (Vertex AI) if configured
    const useDeveloperCredits = !!process.env.GOOGLE_CLOUD_PROJECT;
    
    const inv = body.inventory ?? [];
    const userPrompt = (body.prompt ?? "").trim();

    const system =
      locale === "lv"
        ? `Tu esi HOME:OS Virtuves maltīšu asistents. Atbildi TIKAI ar derīgu JSON objektu šādā formātā (bez markdown):
{"reply":"ievads","missing_for_cart":["produkts"],"meal_ideas":[{"title":"Nosaukums","instructions":"Instrukcija","missing":[],"source_url":"https://www.google.com/search?q=[nosaukums]+recepte","cooking_time":"30 min","temperature":"180C","image_url":"https://loremflickr.com/600/400/food,[keyword]?random=[1-100]"}]}
"source_url" — OBLIGĀTI ģenerē vienkāršu Google meklēšanas saiti: https://www.google.com/search?q=[nosaukums-bez-atstarpem]+recepte. Neizmanto "site:" vai "OR" operatorus, lai garantētu rezultātus.
"image_url" — OBLIGĀTI: https://loremflickr.com/600/400/food,[keyword]?random=[unique-id]. Lieto atšķirīgu anglisku [keyword] un atšķirīgu random skaitli katrai receptei.`
        : `You are the HOME:OS kitchen meal assistant. Reply ONLY with valid JSON (no markdown):
{"reply":"intro","missing_for_cart":["item"],"meal_ideas":[{"title":"Title","instructions":"Instructions","missing":[],"source_url":"https://www.google.com/search?q=[title]+recipe","cooking_time":"30 min","temperature":"180C","image_url":"https://loremflickr.com/600/400/food,[keyword]?random=[unique-id]. Use different English keywords and different random seeds for each idea.`;

    const invLines = inv
      .map(
        (r) =>
          `- ${r.name}${r.category ? ` [${r.category}]` : ""}: ${r.quantity ?? 1}${r.unit ? ` ${r.unit}` : ""}${r.expiry_date ? `, expiry ${r.expiry_date}` : ""}`,
      )
      .join("\n");

    const userBlock = [
      `Pantry:\n${invLines || "(empty)"}`,
      userPrompt
        ? `User question:\n${userPrompt}`
        : `Task: Suggest what to cook soon and what to add to the cart if needed.`,
    ].join("\n\n");

    let result;
    if (useDeveloperCredits) {
      console.log(`[AI] Using Vertex AI Developer Credits (Kitchen) for user: ${user.id}`);
      result = await callVertexAI(system, userBlock);
    } else {
      const { data: cred, error: credErr } = await supabase
        .from("user_kitchen_ai")
        .select("provider, vault_secret_id")
        .eq("user_id", user.id)
        .maybeSingle();

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

      if (secretErr || !secretValue) {
        return NextResponse.json(
          { 
            ok: false, 
            code: "NO_USER_AI_SECRET", 
            message: locale === "lv" ? "Neizdevās nolasīt tavu AI atslēgu no drošās krātuves." : "Could not read your AI key from secure storage." 
          }, 
          { status: 500 }
        );
      }

      const apiKey = String(secretValue).trim();
      result =
        cred.provider === "gemini"
          ? await callGemini(apiKey, system, userBlock)
          : await callOpenAI(apiKey, system, userBlock, cred.provider);
    }

    if (!result.ok) {
      return NextResponse.json({ ok: false, code: "LLM_ERROR", message: result.message }, { status: 502 });
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

