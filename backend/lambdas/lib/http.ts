import type { APIGatewayProxyResultV2 } from 'aws-lambda';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
};

export function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function badRequest(message: string): APIGatewayProxyResultV2 {
  return json(400, { error: message });
}

export function notFound(message: string): APIGatewayProxyResultV2 {
  return json(404, { error: message });
}

export function serverError(message: string): APIGatewayProxyResultV2 {
  return json(500, { error: message });
}
