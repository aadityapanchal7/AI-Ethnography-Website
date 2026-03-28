import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { badRequest, json, notFound, serverError } from '../lib/http';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const table = process.env.POSTS_TABLE;
  if (!table) return serverError('POSTS_TABLE not configured');

  const id = event.pathParameters?.id;
  if (!id) return badRequest('Missing post id');

  try {
    const out = await ddb.send(
      new UpdateCommand({
        TableName: table,
        Key: { id },
        UpdateExpression: 'ADD upvotes :one',
        ConditionExpression: 'attribute_exists(id)',
        ExpressionAttributeValues: { ':one': 1 },
        ReturnValues: 'ALL_NEW',
      })
    );
    const upvotes = Number(out.Attributes?.upvotes ?? 0);
    return json(200, { post: { id, upvotes } });
  } catch (err: unknown) {
    const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : '';
    if (name === 'ConditionalCheckFailedException') {
      return notFound('Post not found');
    }
    console.error(err);
    return serverError('Failed to upvote');
  }
};
