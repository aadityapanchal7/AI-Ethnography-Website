import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { badRequest, json, serverError } from '../lib/http';

const s3 = new S3Client({});

const ALLOWED_TYPES: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mp3': 'mp3',
  'audio/x-m4a': 'm4a',
};

function extensionForContentType(contentType: string): string | null {
  const base = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  return ALLOWED_TYPES[base] ?? null;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const bucket = process.env.AUDIO_BUCKET;
  if (!bucket) return serverError('AUDIO_BUCKET not configured');

  let body: { contentType?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return badRequest('Invalid JSON body');
  }

  const ext = body.contentType ? extensionForContentType(body.contentType) : null;
  if (!body.contentType || !ext) {
    return badRequest('Allowed content types: audio/webm, audio/mp4, audio/mpeg, audio/wav');
  }

  const submissionId = randomUUID();
  const audioKey = `uploads/${submissionId}.${ext}`;

  try {
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: audioKey,
      ContentType: body.contentType.split(';')[0].trim(),
    });
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 14 });

    return json(200, {
      uploadUrl,
      submissionId,
      audioKey,
      expiresInSeconds: 60 * 14,
    });
  } catch (err) {
    console.error(err);
    return serverError('Could not create upload URL');
  }
};
