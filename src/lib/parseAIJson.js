/**
 * Parse JSON from AI model responses that may be wrapped in markdown code fences.
 * Strips ```json ... ``` wrappers and attempts JSON.parse.
 * 
 * @param {string} text - Raw AI response text
 * @param {*} fallback - Value to return if parsing fails (default: null)
 * @returns {{ ok: boolean, data?: any, raw: string }} Parse result
 */
export function parseAIJson(text, fallback = null) {
  if (!text) return { ok: false, data: fallback, raw: text };
  
  const cleaned = text
    .replace(/```json?\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // Try direct parse first
  try {
    const data = JSON.parse(cleaned);
    return { ok: true, data, raw: text };
  } catch {
    // Try extracting JSON object/array from surrounding text
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try {
        const data = JSON.parse(match[0]);
        return { ok: true, data, raw: text };
      } catch {
        // fall through
      }
    }
    return { ok: false, data: fallback, raw: text };
  }
}
