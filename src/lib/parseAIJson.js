/**
 * Parse AI response text that may contain JSON wrapped in markdown code fences.
 * @param {string} text - Raw AI response text
 * @returns {{ ok: true, data: any } | { ok: false, raw: string }}
 */
export function parseAIJson(text) {
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    return { ok: true, data };
  } catch {
    return { ok: false, raw: text };
  }
}
