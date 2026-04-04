import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { anthropicResponseText, extractJsonObject } from './bedrock-json';
import { MODERATION_SYSTEM_PROMPT } from './guidelines';
import { summarizeTranscript } from './summarize-transcript';

const client = new BedrockRuntimeClient({});

export interface ModerationResult {
  approved: boolean;
  reason: string;
  title: string;
  summary: string;
  tags: string[];
}

export async function moderateTranscript(
  transcript: string,
  modelId: string,
  skipModeration: boolean
): Promise<ModerationResult> {
  if (skipModeration) {
    try {
      const s = await summarizeTranscript(transcript, modelId);
      return {
        approved: true,
        reason: 'SKIP_MODERATION with Bedrock title/summary',
        title: s.title.trim() || 'Voice note',
        summary: s.summary.trim() || transcript.trim().slice(0, 500),
        tags: s.tags,
      };
    } catch (err) {
      console.error('summarizeTranscript failed in skip path', err);
      const summary = transcript.trim().slice(0, 500);
      return {
        approved: true,
        reason: 'SKIP_MODERATION fallback (summarize failed)',
        title: 'Community voice note',
        summary: summary || 'Submitted audio story.',
        tags: [],
      };
    }
  }

  const userBlock = `Transcript:\n"""${transcript.replace(/"""/g, '"').slice(0, 24_000)}"""`;
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1600,
    messages: [
      {
        role: 'user',
        content: `${MODERATION_SYSTEM_PROMPT}\n\n${userBlock}`,
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
    throw new Error('Moderation model did not return JSON');
  }

  const parsed = JSON.parse(jsonStr) as ModerationResult;
  if (typeof parsed.approved !== 'boolean') {
    throw new Error('Invalid moderation JSON');
  }

  let title = String(parsed.title ?? '').trim();
  let summary = String(parsed.summary ?? '').trim();
  let tags = Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 5) : [];

  if (parsed.approved && (!title || !summary)) {
    try {
      const s = await summarizeTranscript(transcript, modelId);
      if (!title) title = s.title.trim() || 'Voice note';
      if (!summary) summary = s.summary.trim() || transcript.trim().slice(0, 500);
      if (tags.length === 0 && s.tags.length > 0) tags = s.tags.slice(0, 5);
    } catch (err) {
      console.error('summarizeTranscript fallback after empty moderation title/summary', err);
      if (!title) title = 'Voice note';
      if (!summary) summary = transcript.trim().slice(0, 500) || 'Submitted audio story.';
    }
  }

  return {
    approved: parsed.approved,
    reason: String(parsed.reason ?? ''),
    title,
    summary,
    tags,
  };
}
