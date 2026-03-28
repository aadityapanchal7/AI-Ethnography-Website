import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GetTranscriptionJobCommand, TranscribeClient } from '@aws-sdk/client-transcribe';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { moderateTranscript } from '../lib/moderation';
import { parseTranscriptS3Location } from '../lib/transcript-uri';

const s3 = new S3Client({});
const transcribe = new TranscribeClient({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface TranscribeDetail {
  TranscriptionJobName?: string;
  TranscriptionJobStatus?: string;
  FailureReason?: string;
}

export const handler = async (event: { detail?: TranscribeDetail }) => {
  const detail = event.detail;
  if (!detail?.TranscriptionJobName) {
    console.error('Missing transcription job detail', JSON.stringify(event));
    return;
  }
  const jobName = detail.TranscriptionJobName;
  const status = detail.TranscriptionJobStatus;
  console.info(
    JSON.stringify({ msg: 'process-transcribe-job', jobName, status })
  );

  const submissionsTable = process.env.SUBMISSIONS_TABLE!;
  const postsTable = process.env.POSTS_TABLE!;
  const bucket = process.env.AUDIO_BUCKET!;
  const modelId = process.env.MODERATION_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
  const skipModeration = process.env.SKIP_MODERATION === 'true';

  if (!jobName || !submissionsTable || !postsTable || !bucket) {
    console.error('Missing env');
    return;
  }

  if (status === 'FAILED') {
    await ddb.send(
      new UpdateCommand({
        TableName: submissionsTable,
        Key: { id: jobName },
        UpdateExpression: 'SET #s = :st, updatedAt = :u, failureReason = :f',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':st': 'TRANSCRIBE_FAILED',
          ':u': new Date().toISOString(),
          ':f': detail.FailureReason ?? 'unknown',
        },
      })
    );
    return;
  }

  if (status !== 'COMPLETED') {
    console.info(JSON.stringify({ msg: 'process-transcribe-skip-status', jobName, status }));
    return;
  }

  const jobOut = await transcribe.send(
    new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
  );

  const uri = jobOut.TranscriptionJob?.Transcript?.TranscriptFileUri;
  if (!uri) {
    console.error('No transcript URI');
    return;
  }

  let transcriptText = '';
  try {
    const loc = parseTranscriptS3Location(uri);
    console.info(
      JSON.stringify({
        msg: 'transcript-uri',
        jobName,
        uriPrefix: uri.slice(0, 120),
        getObject: Boolean(loc),
        bucket: loc?.bucket,
      })
    );
    let raw: string | undefined;
    if (loc) {
      const obj = await s3.send(new GetObjectCommand({ Bucket: loc.bucket, Key: loc.key }));
      raw = (await obj.Body?.transformToString()) ?? undefined;
    } else {
      const res = await fetch(uri);
      if (!res.ok) {
        throw new Error(`Transcript fetch ${res.status}: ${res.statusText}`);
      }
      raw = await res.text();
    }
    if (raw) {
      const json = JSON.parse(raw);
      transcriptText = json.results?.transcripts?.[0]?.transcript ?? '';
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        msg: 'transcript-read-failed',
        jobName,
        uriPrefix: uri.slice(0, 120),
        error: err instanceof Error ? err.message : String(err),
      }),
      err
    );
    await ddb.send(
      new UpdateCommand({
        TableName: submissionsTable,
        Key: { id: jobName },
        UpdateExpression: 'SET #s = :st, updatedAt = :u',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':st': 'TRANSCRIPT_READ_FAILED',
          ':u': new Date().toISOString(),
        },
      })
    );
    return;
  }

  const subGet = await ddb.send(new GetCommand({ TableName: submissionsTable, Key: { id: jobName } }));
  const submission = subGet.Item;
  if (!submission) {
    console.error('Submission not found', jobName);
    return;
  }

  let moderation: Awaited<ReturnType<typeof moderateTranscript>>;
  try {
    moderation = await moderateTranscript(transcriptText, modelId, skipModeration);
  } catch (err) {
    console.error('Moderation failed', err);
    await ddb.send(
      new UpdateCommand({
        TableName: submissionsTable,
        Key: { id: jobName },
        UpdateExpression:
          'SET #s = :st, transcriptText = :t, updatedAt = :u, moderationError = :e',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':st': 'MODERATION_FAILED',
          ':t': transcriptText,
          ':u': new Date().toISOString(),
          ':e': String(err),
        },
      })
    );
    return;
  }

  const now = new Date().toISOString();

  if (!moderation.approved) {
    await ddb.send(
      new UpdateCommand({
        TableName: submissionsTable,
        Key: { id: jobName },
        UpdateExpression:
          'SET #s = :st, transcriptText = :t, updatedAt = :u, moderationReason = :r, moderationApproved = :a',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':st': 'MODERATION_REJECTED',
          ':t': transcriptText,
          ':u': now,
          ':r': moderation.reason,
          ':a': false,
        },
      })
    );
    return;
  }

  const postId = randomUUID();
  const metadata = submission.metadata as Record<string, unknown>;

  await ddb.send(
    new PutCommand({
      TableName: postsTable,
      Item: {
        id: postId,
        submissionId: jobName,
        title: moderation.title,
        summary: moderation.summary,
        body: moderation.summary,
        tags: moderation.tags,
        metadata,
        transcriptionStatus: 'completed',
        createdAt: now,
        upvotes: 0,
        transcriptText,
        sourceSubmissionId: jobName,
        ...(typeof submission.latitude === 'number' && typeof submission.longitude === 'number'
          ? {
              latitude: submission.latitude,
              longitude: submission.longitude,
            }
          : {}),
      },
    })
  );

  console.info(JSON.stringify({ msg: 'post-published', jobName, postId }));

  await ddb.send(
    new UpdateCommand({
      TableName: submissionsTable,
      Key: { id: jobName },
      UpdateExpression:
        'SET #s = :st, transcriptText = :t, updatedAt = :u, postId = :p, moderationApproved = :a, moderationReason = :r',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':st': 'PUBLISHED',
        ':t': transcriptText,
        ':u': now,
        ':p': postId,
        ':a': true,
        ':r': moderation.reason,
      },
    })
  );
};
