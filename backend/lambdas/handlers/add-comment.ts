import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { badRequest, json, serverError } from '../lib/http';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const MAX_LEN = 4000;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const postsTable = process.env.POSTS_TABLE;
  const commentsTable = process.env.COMMENTS_TABLE;
  if (!postsTable || !commentsTable) return serverError('Tables not configured');

  const postId = event.pathParameters?.id;
  if (!postId) return badRequest('Missing post id');

  let body: { text?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return badRequest('Invalid JSON');
  }
  const text = (body.text ?? '').trim();
  if (!text) return badRequest('Comment text is required');
  if (text.length > MAX_LEN) return badRequest(`Comment too long (max ${MAX_LEN} characters)`);

  try {
    const post = await ddb.send(new GetCommand({ TableName: postsTable, Key: { id: postId } }));
    if (!post.Item) return json(404, { error: 'Post not found' });

    const commentId = randomUUID();
    const createdAt = new Date().toISOString();
    const commentKey = `${createdAt}#${commentId}`;

    await ddb.send(
      new PutCommand({
        TableName: commentsTable,
        Item: {
          postId,
          commentKey,
          id: commentId,
          body: text,
          authorLabel: 'Anonymous',
          createdAt,
        },
      })
    );

    return json(201, {
      comment: {
        id: commentId,
        postId,
        body: text,
        authorLabel: 'Anonymous',
        createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    return serverError('Could not save comment');
  }
};
