const OPENAI_BASE_URL = "https://api.openai.com/v1";

export type OpenAiModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

type OpenAiModelsResponse = {
  data?: OpenAiModel[];
  error?: {
    message?: string;
  };
};

export function getOpenAiApiKey(): string {
  const apiKey = process.env.OPEN_API_KEY?.trim() ?? "";

  if (!apiKey) {
    throw new Error("Missing OPEN_API_KEY environment variable.");
  }

  return apiKey;
}

export async function fetchOpenAiModels(apiKey = getOpenAiApiKey()) {
  const response = await fetch(`${OPENAI_BASE_URL}/models`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  const data = (await response.json()) as OpenAiModelsResponse;

  if (!response.ok) {
    const message = data.error?.message || "OpenAI request failed.";
    throw new Error(message);
  }

  return data.data ?? [];
}

export async function testOpenAiConnection(apiKey?: string) {
  const models = await fetchOpenAiModels(apiKey);

  return {
    ok: true,
    modelCount: models.length,
    firstModel: models[0]?.id ?? null,
  };
}
