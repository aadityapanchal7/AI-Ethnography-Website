import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { badRequest, json, serverError } from '../lib/http';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const postsTable = process.env.POSTS_TABLE;
  const commentsTable = process.env.COMMENTS_TABLE;
  if (!postsTable || !commentsTable) return serverError('Tables not configured');

  const id = event.pathParameters?.id;
  if (!id) return badRequest('Missing post id');

  try {
    const post = await ddb.send(new GetCommand({ TableName: postsTable, Key: { id } }));
    if (!post.Item) {
      return json(404, { error: 'Not found' });
    }

    const commentsOut = await ddb.send(
      new QueryCommand({
        TableName: commentsTable,
        KeyConditionExpression: 'postId = :p',
        ExpressionAttributeValues: { ':p': id },
        ScanIndexForward: true,
      })
    );

    const comments = (commentsOut.Items ?? []).map((c) => ({
      id: c.id,
      postId: c.postId,
      body: c.body,
      authorLabel: c.authorLabel ?? 'Anonymous',
      createdAt: c.createdAt,
    }));

    const item = post.Item;
    const payload = {
      id: item.id,
      title: item.title,
      summary: item.summary,
      body: item.body,
      tags: item.tags ?? [],
      createdAt: item.createdAt,
      upvotes: item.upvotes ?? 0,
      metadata: item.metadata,
      transcriptText: item.transcriptText,
      transcriptionStatus: item.transcriptionStatus ?? 'completed',
      sourceSubmissionId: item.submissionId ?? item.sourceSubmissionId,
      coordinates:
        typeof item.latitude === 'number' && typeof item.longitude === 'number'
          ? { lat: item.latitude, lng: item.longitude }
          : undefined,
      comments,
    };

    return json(200, { post: payload });
  } catch (err) {
    console.error(err);
    return serverError('Failed to load post');
  }
};
