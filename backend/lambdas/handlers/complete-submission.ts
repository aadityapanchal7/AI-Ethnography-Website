import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  StartTranscriptionJobCommand,
  TranscribeClient,
  type LanguageCode,
  type MediaFormat,
} from '@aws-sdk/client-transcribe';
import { badRequest, json, serverError } from '../lib/http';
import { mediaFormatFromAudioKey, resolveTranscribeLanguageCode } from '../lib/transcribe-job';

const s3 = new S3Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const transcribe = new TranscribeClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const bucket = process.env.AUDIO_BUCKET;
  const transcriptOutputBucket =
    process.env.TRANSCRIPT_OUTPUT_BUCKET?.trim() || bucket;
  const submissionsTable = process.env.SUBMISSIONS_TABLE;
  const transcribeRoleArn = process.env.TRANSCRIBE_DATA_ACCESS_ROLE_ARN;

  if (!bucket || !submissionsTable || !transcribeRoleArn) {
    return serverError('Missing env AUDIO_BUCKET, SUBMISSIONS_TABLE, or TRANSCRIBE_DATA_ACCESS_ROLE_ARN');
  }

  let body: {
    submissionId?: string;
    audioKey?: string;
    metadata?: Record<string, unknown>;
    consentGiven?: boolean;
    latitude?: number;
    longitude?: number;
    locationSource?: string;
  };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return badRequest('Invalid JSON body');
  }

  const { submissionId, audioKey, metadata, consentGiven } = body;
  if (!submissionId || !audioKey || !metadata || consentGiven !== true) {
    return badRequest('submissionId, audioKey, metadata, and consentGiven (true) are required');
  }

  if (!audioKey.startsWith(`uploads/${submissionId}.`)) {
    return badRequest('audioKey does not match submissionId');
  }

  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: audioKey }));
  } catch {
    return badRequest('Audio file not found in storage. Finish upload before completing.');
  }

  const now = new Date().toISOString();

  try {
    await ddb.send(
      new PutCommand({
        TableName: submissionsTable,
        Item: {
          id: submissionId,
          status: 'PROCESSING_TRANSCRIBE',
          audioKey,
          metadata,
          consentGiven: true,
          consentAt: now,
          createdAt: now,
          updatedAt: now,
          ...(typeof body.latitude === 'number' && typeof body.longitude === 'number'
            ? {
                latitude: body.latitude,
                longitude: body.longitude,
                locationSource: body.locationSource ?? 'browser',
              }
            : {}),
        },
      })
    );
  } catch (err) {
    console.error('DynamoDB Put submission failed', err);
    return serverError('Could not save submission');
  }

  const languageCode = resolveTranscribeLanguageCode(
    metadata.language,
    process.env.TRANSCRIBE_LANGUAGE_CODE
  );
  const mediaFormat = mediaFormatFromAudioKey(audioKey);

  console.info('StartTranscriptionJob context', {
    mediaBucket: bucket,
    transcriptOutputBucket,
    separateTranscriptBucket: transcriptOutputBucket !== bucket,
    hasTranscriptEnv: Boolean(process.env.TRANSCRIPT_OUTPUT_BUCKET?.trim()),
    audioKey,
    languageCode,
    mediaFormat,
    transcribeRegion: process.env.AWS_REGION,
  });

  try {
    await transcribe.send(
      new StartTranscriptionJobCommand({
        TranscriptionJobName: submissionId,
        LanguageCode: languageCode as LanguageCode,
        ...(mediaFormat ? { MediaFormat: mediaFormat as MediaFormat } : {}),
        Media: { MediaFileUri: `s3://${bucket}/${audioKey}` },
        OutputBucketName: transcriptOutputBucket,
        // Explicit .json object key (prefix-only keys get job-name subpaths; this matches AWS examples).
        OutputKey: `transcripts/${submissionId}.json`,
        // Top-level DataAccessRoleArn is NOT serialized by the Transcribe API — role must be here.
        // AllowDeferredExecution true: required pairing for Transcribe to use the data-access role for S3 validation.
        JobExecutionSettings: {
          AllowDeferredExecution: true,
          DataAccessRoleArn: transcribeRoleArn,
        },
      })
    );
  } catch (err) {
    const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : 'Error';
    const message = err instanceof Error ? err.message : String(err);
    console.error('StartTranscriptionJob failed', name, message, err);
    try {
      await ddb.send(
        new UpdateCommand({
          TableName: submissionsTable,
          Key: { id: submissionId },
          UpdateExpression:
            'SET #s = :st, updatedAt = :u, transcribeStartError = :e',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: {
            ':st': 'TRANSCRIBE_START_FAILED',
            ':u': new Date().toISOString(),
            ':e': `${name}: ${message}`.slice(0, 1800),
          },
        })
      );
    } catch (markErr) {
      console.error('Could not mark submission after Transcribe failure', markErr);
    }
    return json(500, {
      error: 'Could not start transcription',
      detail: `${name}: ${message}`,
    });
  }

  return json(200, {
    ok: true,
    submissionId,
    message: 'Submission received. Transcription and moderation will begin shortly.',
  });
};
