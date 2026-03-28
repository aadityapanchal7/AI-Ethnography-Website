/**
 * Transcribe's TranscriptFileUri is often an https:// S3 URL. Unauthenticated fetch()
 * returns 403 on private buckets; use GetObject with Lambda IAM instead.
 */
export function parseTranscriptS3Location(uri: string): { bucket: string; key: string } | null {
  const trimmed = uri.trim();
  if (trimmed.startsWith('s3://')) {
    const rest = trimmed.slice('s3://'.length);
    const slash = rest.indexOf('/');
    if (slash <= 0) return null;
    return {
      bucket: rest.slice(0, slash),
      key: decodeURIComponent(rest.slice(slash + 1).replace(/^\/+/, '')),
    };
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/^\/+/, '');
    if (!path) return null;

    const virtualBucket = parseVirtualHostedStyleBucket(host);
    if (virtualBucket) {
      return { bucket: virtualBucket, key: decodeURIComponent(path) };
    }

    if (/^s3([.-][a-z0-9-]+)?\.amazonaws\.com$/i.test(host) || host === 's3.amazonaws.com') {
      const i = path.indexOf('/');
      if (i <= 0) return null;
      const bucket = path.slice(0, i);
      const key = path.slice(i + 1);
      if (!bucket || !key) return null;
      return { bucket, key: decodeURIComponent(key) };
    }
  } catch {
    return null;
  }
  return null;
}

function parseVirtualHostedStyleBucket(host: string): string | null {
  const dual = host.match(/^(.+)\.s3\.dualstack\.([a-z0-9-]+)\.amazonaws\.com$/i);
  if (dual) return dual[1];
  const regional = host.match(/^(.+)\.s3\.([a-z0-9-]+)\.amazonaws\.com$/i);
  if (regional && regional[2].toLowerCase() !== 'dualstack') return regional[1];
  if (host.endsWith('.s3.amazonaws.com')) {
    const bucket = host.slice(0, -'.s3.amazonaws.com'.length);
    return bucket || null;
  }
  return null;
}
