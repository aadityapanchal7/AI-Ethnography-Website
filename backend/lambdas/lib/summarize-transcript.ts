import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { anthropicResponseText, extractJsonObject } from './bedrock-json';

const client = new BedrockRuntimeClient({});

export interface SummarizeResult {
  title: string;
  summary: string;
  tags: string[];
}

const SUMMARY_SYSTEM = `You analyze transcripts of group voice recordings about AI in health and medicine.
Return ONLY a single JSON object (no markdown code fences) with this exact shape:
{"title":string,"summary":string,"tags":string[]}

Rules:
- title: at most ~90 characters; specific to what the speakers actually said (never generic placeholders like "Community voice note").
- summary: Write 2–4 clear sentences summarizing what was said and why it matters. Then a blank line, then the exact line "Key points:" then 3–6 bullet lines, each starting with "- ", capturing distinct ideas, feelings, concerns, or stories from the speakers. Total summary field should stay under 1200 characters if possible.
- tags: 0–5 short lowercase hyphenated thematic labels inferred from the content (no names, no PII).

If the transcript is empty or too short to summarize, use title "Voice note (too short)" and a brief summary explaining more detail is needed, tags [].`;

export async function summarizeTranscript(
  transcript: string,
  modelId: string
): Promise<SummarizeResult> {
  const block = transcript.replace(/"""/g, '"').slice(0, 24_000);
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1400,
    messages: [
      {
        role: 'user',
        content: `${SUMMARY_SYSTEM}\n\nTranscript:\n"""${block}"""`,
      },
    ],
  });

  const out = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: new TextEncoder().encode(body),
    })
  );

  const raw = JSON.parse(new TextDecoder().decode(out.body));
  const text = anthropicResponseText(raw);
  const jsonStr = extractJsonObject(text);
  if (!jsonStr) {
    throw new Error('Summarize model did not return JSON');
  }

  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
  return {
    title: String(parsed.title ?? '').slice(0, 200),
    summary: String(parsed.summary ?? '').slice(0, 2000),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 8) : [],
  };
}
