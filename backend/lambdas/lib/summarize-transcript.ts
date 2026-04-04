import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { anthropicResponseText, tryParseAnyJsonObject } from './bedrock-json';

const bedrockRegion =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const client = new BedrockRuntimeClient({ region: bedrockRegion });

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
  const parsed = tryParseAnyJsonObject(text);
  if (!parsed) {
    console.error(
      JSON.stringify({
        msg: 'summarize-json-miss',
        textPrefix: text.slice(0, 400),
        textLen: text.length,
      })
    );
    throw new Error('Summarize model did not return JSON');
  }

  let title = String(parsed.title ?? '').trim().slice(0, 200);
  let summary = String(parsed.summary ?? '').trim().slice(0, 2000);
  const tags = Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 8) : [];
  const t = transcript.trim();
  if (!title) title = t ? `${t.slice(0, 88)}${t.length > 88 ? '…' : ''}` : 'Voice note';
  if (!summary) summary = t.slice(0, 500) || 'Unable to summarize transcript.';
  return { title, summary, tags };
}
