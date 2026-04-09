type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

type SupabaseServerEnv = SupabasePublicEnv & {
  serviceRoleKey: string;
};

const PUBLIC_ENV_ERROR =
  "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.";

const SERVER_ENV_ERROR =
  "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, and SUPABASE_SERVICE_ROLE_KEY.";

export type GoogleFitOauthEnv = {
  clientId: string;
  clientSecret: string | null;
};

function normalize(value: string | undefined) {
  const next = value?.trim();
  return next ? next : null;
}

export function getGoogleFitOauthClientId(): string | null {
  return normalize(
    process.env.GOOGLE_FIT_OAUTH_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID,
  );
}

export function getGoogleFitOauthClientSecret(): string | null {
  return normalize(process.env.GOOGLE_FIT_OAUTH_CLIENT_SECRET);
}

export function getGoogleFitOauthEnv(): GoogleFitOauthEnv | null {
  const clientId = getGoogleFitOauthClientId();
  if (!clientId) {
    return null;
  }
  return {
    clientId,
    clientSecret: getGoogleFitOauthClientSecret(),
  };
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function getSupabaseServerEnv(): SupabaseServerEnv | null {
  const publicEnv = getSupabasePublicEnv();
  const serviceRoleKey = normalize(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!publicEnv || !serviceRoleKey) {
    return null;
  }

  return {
    ...publicEnv,
    serviceRoleKey,
  };
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(PUBLIC_ENV_ERROR);
  }
  return env;
}

export function requireSupabaseServerEnv(): SupabaseServerEnv {
  const env = getSupabaseServerEnv();
  if (!env) {
    throw new Error(SERVER_ENV_ERROR);
  }
  return env;
}
