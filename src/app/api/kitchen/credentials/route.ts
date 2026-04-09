import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServerEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

type PostBody = {
  provider?: "openai" | "gemini";
  apiKey?: string;
};

function getKeyLastFour(key: string) {
  const clean = key.trim();
  return clean.length >= 4 ? clean.slice(-4) : clean;
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

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ ok: false, code: "NO_AUTH" }, { status: 401 });
    }

    const body = (await request.json()) as PostBody;
    const provider = body.provider;
    const apiKey = body.apiKey?.trim();

    if (provider !== "openai" && provider !== "gemini") {
      return NextResponse.json({ ok: false, code: "BAD_PROVIDER" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ ok: false, code: "KEY_MISSING" }, { status: 400 });
    }

    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("user_kitchen_ai")
      .select("vault_secret_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingErr) {
      if (existingErr.code === "PGRST205") {
        return NextResponse.json({ ok: false, code: "SCHEMA_MISSING" }, { status: 500 });
      }
      return NextResponse.json(
        { ok: false, code: "READ_FAILED", message: existingErr.message },
        { status: 500 },
      );
    }

    let vaultSecretId: string;

    if (existing?.vault_secret_id) {
      const { error: updateSecretErr } = await supabaseAdmin
        .schema("vault")
        .rpc("update_secret", {
          secret_id: existing.vault_secret_id,
          new_secret: apiKey,
          new_name: `user_kitchen_ai_${user.id}`,
          new_description: `Kitchen AI key for user ${user.id}`,
        });

      if (updateSecretErr) {
        return NextResponse.json(
          { ok: false, code: "VAULT_UPDATE_FAILED", message: updateSecretErr.message },
          { status: 500 },
        );
      }

      vaultSecretId = existing.vault_secret_id;
    } else {
      const { data: createSecretData, error: createSecretErr } = await supabaseAdmin
        .schema("vault")
        .rpc("create_secret", {
          secret: apiKey,
          name: `user_kitchen_ai_${user.id}`,
          description: `Kitchen AI key for user ${user.id}`,
        });

      if (createSecretErr || !createSecretData) {
        return NextResponse.json(
          {
            ok: false,
            code: "VAULT_CREATE_FAILED",
            message: createSecretErr?.message ?? "No secret id returned",
          },
          { status: 500 },
        );
      }

      vaultSecretId = String(createSecretData);
    }

    const { error: upsertErr } = await supabaseAdmin.from("user_kitchen_ai").upsert(
      {
        user_id: user.id,
        provider,
        vault_secret_id: vaultSecretId,
        key_last_four: getKeyLastFour(apiKey),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (upsertErr) {
      return NextResponse.json(
        { ok: false, code: "UPSERT_FAILED", message: upsertErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, code: "SERVER", message: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ ok: false, code: "NO_AUTH" }, { status: 401 });
    }

    const { error: deleteErr } = await supabaseAdmin
      .from("user_kitchen_ai")
      .delete()
      .eq("user_id", user.id);

    if (deleteErr) {
      if (deleteErr.code === "PGRST205") {
        return NextResponse.json({ ok: false, code: "SCHEMA_MISSING" }, { status: 500 });
      }
      return NextResponse.json(
        { ok: false, code: "DELETE_FAILED", message: deleteErr.message },
        { status: 500 },
      );
    }

    // Šajā versijā Vault secrets vēl netiek tīrīti ārā.
    // Ja vajadzēs, nākamajā solī pieliksim arī secret cleanup.
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, code: "SERVER", message: msg }, { status: 500 });
  }
}
