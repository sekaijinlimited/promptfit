export interface LLMOptions {
  apiUrl: string;
  apiKey?: string;
  model: string;
}

interface OllamaResponse {
  message?: { content: string };
  choices?: Array<{ message: { content: string } }>;
}

export async function chatCompletion(
  options: LLMOptions,
  system: string,
  userMessage: string,
): Promise<string> {
  const isOllama = options.apiUrl.includes("11434");
  const endpoint = isOllama
    ? `${options.apiUrl}/api/chat`
    : `${options.apiUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.apiKey) {
    headers["Authorization"] = `Bearer ${options.apiKey}`;
  }

  const body = JSON.stringify({
    model: options.model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
    stream: false,
  });

  const res = await fetch(endpoint, { method: "POST", headers, body });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `LLM API error (${res.status}): ${text || res.statusText}`,
    );
  }

  const data = (await res.json()) as OllamaResponse;

  // Ollama format
  if (data.message?.content) {
    return data.message.content.trim();
  }

  // OpenAI-compatible format
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  }

  throw new Error("Unexpected LLM response format");
}
