import { FRACTION_HINTS, SCIENCE_HINTS } from "../content/content";

/**
 * Phase 9 (optional): server-side AI hint. Works fully WITHOUT any API key by
 * returning reviewed predefined hints. If AI_API_KEY/AI_API_URL/AI_MODEL are set,
 * it asks the model only for a short hint (never an answer, never student names,
 * never scores/validation) with a 4s timeout and falls back on any failure.
 */
export async function getAiHint(subject: string, mistake: string): Promise<string> {
  const fallback = subject === "science" ? SCIENCE_HINTS[1] : FRACTION_HINTS[1];
  const key = process.env.AI_API_KEY, url = process.env.AI_API_URL, model = process.env.AI_MODEL;
  if (!key || !url || !model) return `Hint: ${fallback}`;
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You help students aged 11-16. Give ONE short hint (max 40 words). Never give the full answer." },
          { role: "user", content: `Subject: ${subject}. Mistake category: ${mistake}. Give a hint only.` },
        ],
        max_tokens: 80,
      }),
    });
    clearTimeout(t);
    if (!res.ok) return `Hint: ${fallback}`;
    const data: any = await res.json();
    const text = String(data?.choices?.[0]?.message?.content || "").replace(/\s+/g, " ").trim().slice(0, 240);
    return text ? `Hint: ${text}` : `Hint: ${fallback}`;
  } catch { return `Hint: ${fallback}`; }
}
