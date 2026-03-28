import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { json, serverError } from '../lib/http';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type SortKey = 'recent' | 'upvotes' | 'title';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const table = process.env.POSTS_TABLE;
  if (!table) return serverError('POSTS_TABLE not configured');

  const raw = event.queryStringParameters?.sort ?? 'recent';
  const sort: SortKey =
    raw === 'upvotes' || raw === 'title' ? raw : 'recent';

  try {
    const out = await ddb.send(
      new ScanCommand({
        TableName: table,
      })
    );

    const items = (out.Items ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      body: item.body,
      tags: item.tags ?? [],
      createdAt: item.createdAt,
      upvotes: item.upvotes ?? 0,
      metadata: item.metadata,
      audioUrl: item.audioUrl,
      transcriptText: item.transcriptText,
      transcriptionStatus: item.transcriptionStatus ?? 'completed',
      sourceSubmissionId: item.submissionId ?? item.sourceSubmissionId,
      coordinates:
        typeof item.latitude === 'number' && typeof item.longitude === 'number'
          ? { lat: item.latitude, lng: item.longitude }
          : undefined,
      comments: [],
    }));

    if (sort === 'upvotes') {
      items.sort((a, b) => {
        const du = (b.upvotes ?? 0) - (a.upvotes ?? 0);
        if (du !== 0) return du;
        return String(b.createdAt).localeCompare(String(a.createdAt));
      });
    } else if (sort === 'title') {
      items.sort((a, b) =>
        String(a.title).localeCompare(String(b.title), undefined, { sensitivity: 'base' })
      );
    } else {
      items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }

    return json(200, { posts: items });
  } catch (err) {
    console.error(err);
    return serverError('Failed to list posts');
  }
};
