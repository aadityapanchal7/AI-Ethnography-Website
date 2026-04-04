/**
 * Helpers for parsing JSON from Bedrock Anthropic Messages responses.
 * Models may split output across multiple content blocks or wrap JSON in markdown fences.
 */

export function anthropicResponseText(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const content = (body as { content?: unknown }).content;
  if (!Array.isArray(content)) return '';
  const parts: string[] = [];
  for (const block of content) {
    if (!block || typeof block !== 'object') continue;
    const text = (block as { text?: unknown }).text;
    if (typeof text === 'string' && text.length > 0) parts.push(text);
  }
  return parts.join('\n');
}

/** First top-level `{ ... }` in the string, respecting JSON strings (no naive greedy regex). */
export function extractJsonObject(raw: string): string | null {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '').trim();
  const start = s.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}
