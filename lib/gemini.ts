import "server-only";
import { ConfigError } from "./errors";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function geminiModel() {
  return process.env.GEMINI_MODEL || "gemini-3.8-flash";
}

interface GenerateOptions {
  system: string;
  prompt: string;
  /** Gemini response schema (OpenAPI subset). Forces the model to return JSON of this shape. */
  schema: Record<string, unknown>;
  temperature?: number;
}

/** Calls the Gemini REST API and returns the parsed JSON response. */
export async function generateJson<T>({ system, prompt, schema, temperature = 0.6 }: GenerateOptions): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ConfigError("Gemini is not configured. Add GEMINI_API_KEY to .env.local (see .env.example).");
  }

  const res = await fetch(`${API_BASE}/${geminiModel()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    cache: "no-store",
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`Gemini API error (${res.status}): ${detail}`);
  }

  const data = await res.json();
  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
  }
  const text: string | undefined = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new Error("Gemini returned an empty response.");

  // responseMimeType should guarantee raw JSON, but strip code fences defensively.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as T;
}
