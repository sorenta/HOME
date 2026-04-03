type OpenAiModel = {
  id: string;
};

type OpenAiModelsResponse = {
  data?: OpenAiModel[];
};

export function getOpenAiApiKey(): string {
  const apiKey = process.env.OPEN_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing OPEN_API_KEY environment variable");
  }

  return apiKey;
}

export async function fetchOpenAiModels(): Promise<OpenAiModel[]> {
  const apiKey = getOpenAiApiKey();

  const response = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI models request failed: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as OpenAiModelsResponse;
  return Array.isArray(json.data) ? json.data : [];
}

export async function testOpenAiConnection() {
  const models = await fetchOpenAiModels();

  return {
    ok: true,
    modelCount: models.length,
    firstModel: models[0]?.id ?? null,
  };
}
