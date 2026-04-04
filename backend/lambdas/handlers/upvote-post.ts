import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { badRequest, json, notFound, serverError } from '../lib/http';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const VOTER_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

function readHeader(headers: Record<string, string | undefined>, name: string): string | undefined {
  const exact = headers[name];
  if (exact) return exact;
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const postsTable = process.env.POSTS_TABLE;
  const votesTable = process.env.VOTES_TABLE;
  if (!postsTable || !votesTable) return serverError('Tables not configured');

  const id = event.pathParameters?.id;
  if (!id) return badRequest('Missing post id');
  const voterId = (readHeader(event.headers ?? {}, 'x-voter-id') ?? '').trim();
  if (!VOTER_ID_PATTERN.test(voterId)) {
    return badRequest('Missing or invalid voter id');
  }

  try {
    const voteKey = `${id}#${voterId}`;
    const createdAt = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;

    await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: votesTable,
              Item: { voteKey, postId: id, voterId, createdAt, ttl },
              ConditionExpression: 'attribute_not_exists(voteKey)',
            },
          },
          {
            Update: {
              TableName: postsTable,
              Key: { id },
              UpdateExpression: 'ADD upvotes :one',
              ConditionExpression: 'attribute_exists(id)',
              ExpressionAttributeValues: { ':one': 1 },
            },
          },
        ],
      })
    );

    const postOut = await ddb.send(
      new GetCommand({
        TableName: postsTable,
        Key: { id },
        ProjectionExpression: 'upvotes',
      })
    );
    const upvotes = Number(postOut.Item?.upvotes ?? 0);
    return json(200, { post: { id, upvotes } });
  } catch (err: unknown) {
    const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : '';
    if (name === 'TransactionCanceledException') {
      try {
        const [postOut, voteOut] = await Promise.all([
          ddb.send(new GetCommand({ TableName: postsTable, Key: { id } })),
          ddb.send(new GetCommand({ TableName: votesTable, Key: { voteKey: `${id}#${voterId}` } })),
        ]);
        if (!postOut.Item) return notFound('Post not found');
        if (voteOut.Item) return json(409, { error: 'Already voted' });
      } catch {
        // Fall through to generic server error if reconciliation check fails.
      }
    }
    console.error(err);
    return serverError('Failed to upvote');
  }
};
