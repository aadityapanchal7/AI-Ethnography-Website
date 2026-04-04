/**
 * Helpers for parsing JSON from Bedrock Anthropic Messages responses.
 * Models may split output across multiple content blocks or wrap JSON in markdown fences.
 */

function collectTextFromContentArray(content: unknown): string {
  if (!Array.isArray(content)) return '';
  const parts: string[] = [];
  for (const block of content) {
    if (!block || typeof block !== 'object') continue;
    const b = block as Record<string, unknown>;
    if (typeof b.text === 'string' && b.text.length > 0) parts.push(b.text);
  }
  return parts.join('\n');
}

/** Text from InvokeModel / Messages-style Anthropic payloads (multiple shapes). */
export function anthropicResponseText(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const o = body as Record<string, unknown>;
  const fromRoot = collectTextFromContentArray(o.content);
  if (fromRoot) return fromRoot;
  if (typeof o.completion === 'string') return o.completion;
  const output = o.output;
  if (output && typeof output === 'object') {
    const oo = output as Record<string, unknown>;
    const fromOut = collectTextFromContentArray(oo.content);
    if (fromOut) return fromOut;
    if (typeof oo.text === 'string') return oo.text;
  }
  return '';
}

/** Balanced `{...}` substring starting at `start` (must be `{`), respecting JSON strings. */
export function extractBalancedJson(s: string, start: number): string | null {
  if (s[start] !== '{') return null;
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

/** First JSON object in the string (from first `{`). */
export function extractJsonObject(raw: string): string | null {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '').trim();
  const start = s.indexOf('{');
  if (start < 0) return null;
  return extractBalancedJson(s, start);
}

/**
 * Try every `{` in the model text until `JSON.parse` succeeds.
 * Handles leading prose ("Here is the JSON:") and multiple `{` false starts.
 */
export function tryParseAnyJsonObject(text: string): Record<string, unknown> | null {
  let s = text.trim();
  s = s.replace(/^```(?:json)?\s*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '').trim();
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '{') continue;
    const slice = extractBalancedJson(s, i);
    if (!slice) continue;
    try {
      return JSON.parse(slice) as Record<string, unknown>;
    } catch {
      continue;
    }
  }
  return null;
}
