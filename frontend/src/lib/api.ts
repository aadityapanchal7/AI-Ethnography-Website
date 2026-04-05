/**
 * API layer: talks to AWS HTTP API when `NEXT_PUBLIC_API_BASE_URL` is set (trimmed, no trailing slash).
 * If that env var is empty, the browser never calls API Gateway — submissions succeed as a **mock** only
 * (nothing in S3/DynamoDB), and Explore uses bundled mock data. Restart `next dev` after changing the env var.
 */

import type {
  SubmitPayload,
  SubmitResponse,
  Testimonial,
  DiscussionPost,
  DiscussionComment,
  Theme,
  MapDataPoint,
  HighlightFilters,
  MapFilters,
  Metadata,
  DiscussionPostSort,
} from './types';
import { mockDiscussionPosts, mockTestimonials, mockThemes, specialties } from './mockData';

function normalizePublicApiBase(raw: string | undefined): string {
  return (raw ?? '').trim().replace(/\/+$/, '');
}

/** AWS API Gateway base URL from CDK output `HttpApiUrl`, or empty for mock-only mode. */
const API_BASE = normalizePublicApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
const VOTER_COOKIE_NAME = 'ae_voter_id';
const VOTER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

let warnedMockMode = false;
function warnMockSubmitOnce() {
  if (warnedMockMode || typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;
  warnedMockMode = true;
  console.warn(
    '[API] NEXT_PUBLIC_API_BASE_URL is unset → submissions are MOCK (no S3 upload, no post in AWS). ' +
      'Add your deployed HttpApiUrl to .env.local and restart next dev to use the real pipeline.'
  );
}

// Simulate network delay for realistic UX testing
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(encodedName)) continue;
    const value = trimmed.slice(encodedName.length);
    return value ? decodeURIComponent(value) : null;
  }
  return null;
}

function isValidVoterId(value: string | null): value is string {
  if (!value) return false;
  // Keep validation permissive enough for UUIDs and future token formats.
  return /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

function ensureAnonymousVoterId(): string | null {
  if (typeof document === 'undefined') return null;
  const existing = getCookieValue(VOTER_COOKIE_NAME);
  if (isValidVoterId(existing)) return existing;

  const next = crypto.randomUUID().replace(/[^A-Za-z0-9_-]/g, '_');
  document.cookie = [
    `${encodeURIComponent(VOTER_COOKIE_NAME)}=${encodeURIComponent(next)}`,
    `Max-Age=${VOTER_COOKIE_MAX_AGE_SECONDS}`,
    'Path=/',
    'SameSite=Lax',
  ].join('; ');
  return next;
}

/**
 * Submit a new testimonial
 * 
 * Current: Stores in memory and returns mock ID
 * Future: POST metadata to API Gateway, upload audio to S3 via presigned URL
 */
export async function submitTestimonial(payload: SubmitPayload): Promise<SubmitResponse> {
  if (!payload.consentGiven) {
    return { success: false, error: 'Consent is required' };
  }

  if (!payload.audioBlob) {
    return { success: false, error: 'Audio recording is required' };
  }

  if (!payload.metadata.country || !payload.metadata.careerStage) {
    return { success: false, error: 'Required metadata fields are missing' };
  }

  if (API_BASE) {
    try {
      const contentType = payload.audioBlob.type || 'audio/webm';
      const presignRes = await fetch(`${API_BASE}/uploads/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType }),
      });
      if (!presignRes.ok) {
        const message = await presignRes.text();
        return { success: false, error: message || 'Could not start upload' };
      }
      const { uploadUrl, submissionId, audioKey } = (await presignRes.json()) as {
        uploadUrl: string;
        submissionId: string;
        audioKey: string;
      };

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: payload.audioBlob,
        headers: { 'Content-Type': contentType },
      });
      if (!putRes.ok) {
        return { success: false, error: 'Upload to storage failed' };
      }

      const { coordinates, locationSource, specialty, ...metaRest } = payload.metadata;
      const metadataOut: Record<string, unknown> = { ...metaRest };
      if (specialty?.trim()) metadataOut.specialty = specialty.trim();

      const completeBody: Record<string, unknown> = {
        submissionId,
        audioKey,
        metadata: metadataOut,
        consentGiven: payload.consentGiven,
      };
      if (coordinates) {
        completeBody.latitude = coordinates.lat;
        completeBody.longitude = coordinates.lng;
        completeBody.locationSource = locationSource ?? 'browser';
      }

      const doneRes = await fetch(`${API_BASE}/submissions/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeBody),
      });
      if (!doneRes.ok) {
        const raw = await doneRes.text();
        let message = raw || 'Could not complete submission';
        try {
          const parsed = JSON.parse(raw) as { error?: string; detail?: string };
          if (parsed.detail) {
            message = parsed.error
              ? `${parsed.error}: ${parsed.detail}`
              : parsed.detail;
          } else if (parsed.error) {
            message = parsed.error;
          }
        } catch {
          /* plain text body */
        }
        return { success: false, error: message };
      }
      const doneJson = (await doneRes.json()) as { submissionId?: string };
      return { success: true, id: doneJson.submissionId ?? submissionId };
    } catch (e) {
      console.error(e);
      return { success: false, error: e instanceof Error ? e.message : 'Network error' };
    }
  }

  await simulateDelay(1000);
  const newId = `testimonial-${Date.now()}`;
  warnMockSubmitOnce();
  console.log('[API] Testimonial submitted (mock):', {
    id: newId,
    metadata: payload.metadata,
    audioSize: payload.audioBlob.size,
  });
  return { success: true, id: newId };
}

/** True when the browser bundle is configured to call AWS (API Gateway). */
export function isLiveApiConfigured(): boolean {
  return Boolean(API_BASE);
}

function mapApiPost(raw: Record<string, unknown>): DiscussionPost {
  const comments = (raw.comments as DiscussionPost['comments']) ?? [];
  const ts = raw.transcriptionStatus as DiscussionPost['transcriptionStatus'] | undefined;
  const metadata = (raw.metadata as DiscussionPost['metadata']) ?? ({} as DiscussionPost['metadata']);
  const coordinates = raw.coordinates as DiscussionPost['coordinates'];
  const mergedMetadata: DiscussionPost['metadata'] = {
    ...metadata,
    isGroupSubmission: Boolean(metadata.isGroupSubmission),
    contributorIdentities: metadata.contributorIdentities,
    specialty: metadata.specialty,
    ...(coordinates && !metadata.coordinates ? { coordinates } : {}),
  };
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    body: String(raw.body ?? ''),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    createdAt: String(raw.createdAt ?? ''),
    upvotes: Number(raw.upvotes ?? 0),
    metadata: mergedMetadata,
    audioUrl: raw.audioUrl as string | undefined,
    transcriptText: raw.transcriptText as string | undefined,
    transcriptionStatus: ts ?? 'completed',
    sourceSubmissionId: (raw.sourceSubmissionId as string | undefined) ?? (raw.submissionId as string | undefined),
    coordinates,
    comments,
  };
}

/** Coalesce post + metadata coordinates (API may send either). */
function postCoordinates(post: DiscussionPost): Metadata['coordinates'] | undefined {
  return post.coordinates ?? post.metadata.coordinates;
}

function discussionPostToMapPoint(post: DiscussionPost): MapDataPoint | null {
  const coordinates = postCoordinates(post);
  if (
    !coordinates ||
    typeof coordinates.lat !== 'number' ||
    typeof coordinates.lng !== 'number' ||
    Number.isNaN(coordinates.lat) ||
    Number.isNaN(coordinates.lng)
  ) {
    return null;
  }
  const stableId = post.sourceSubmissionId ?? post.id;
  return {
    id: stableId,
    coordinates,
    country: post.metadata.country,
    careerStage: post.metadata.careerStage,
    highlight: post.summary || post.title,
    metadata: post.metadata,
    discussionPostId: post.id,
  };
}

function discussionPostToHighlight(post: DiscussionPost): Testimonial | null {
  const coordinates = postCoordinates(post);
  if (
    !coordinates ||
    typeof coordinates.lat !== 'number' ||
    typeof coordinates.lng !== 'number'
  ) {
    return null;
  }
  const themeIds: string[] = [];
  if (post.tags.length > 0) {
    for (const tag of post.tags) {
      const n = tag.trim().toLowerCase();
      if (n) themeIds.push(`tag:${n}`);
    }
  } else {
    const spec = post.metadata.specialty?.trim();
    if (spec) themeIds.push(`specialty:${spec}`);
    else themeIds.push('theme:community-voice');
  }
  return {
    id: post.sourceSubmissionId ?? post.id,
    metadata: post.metadata,
    highlight: post.summary || post.title,
    submittedAt: post.createdAt,
    coordinates,
    themeIds,
  };
}

function postMatchesApiThemeId(post: DiscussionPost, themeId: string): boolean {
  if (themeId === 'theme:community-voice') {
    return post.tags.length === 0 && !post.metadata.specialty?.trim();
  }
  if (themeId.startsWith('tag:')) {
    const want = themeId.slice(4).toLowerCase();
    return post.tags.some((t) => t.trim().toLowerCase() === want);
  }
  if (themeId.startsWith('specialty:')) {
    const spec = themeId.slice('specialty:'.length);
    return post.metadata.specialty === spec;
  }
  return false;
}

function specialtyThemeLabel(value: string): string {
  return specialties.find((s) => s.value === value)?.label ?? value;
}

function buildThemesFromPosts(posts: DiscussionPost[]): Theme[] {
  const counts = new Map<string, { title: string; count: number }>();
  for (const p of posts) {
    if (p.tags.length > 0) {
      for (const tag of p.tags) {
        const trimmed = tag.trim();
        if (!trimmed) continue;
        const key = `tag:${trimmed.toLowerCase()}`;
        const prev = counts.get(key);
        counts.set(key, { title: trimmed, count: (prev?.count ?? 0) + 1 });
      }
    } else {
      const spec = p.metadata.specialty?.trim();
      if (spec) {
        const key = `specialty:${spec}`;
        const prev = counts.get(key);
        counts.set(key, {
          title: specialtyThemeLabel(spec),
          count: (prev?.count ?? 0) + 1,
        });
      } else {
        const key = 'theme:community-voice';
        const prev = counts.get(key);
        counts.set(key, {
          title: 'Community voices',
          count: (prev?.count ?? 0) + 1,
        });
      }
    }
  }
  return Array.from(counts.entries())
    .map(([id, { title, count }]) => ({
      id,
      title,
      description: 'Themes from community voice posts on the map and discussion.',
      count,
      isNew: count === 1,
      isEmerging: count >= 2 && count <= 5,
    }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}

const inflightBySort = new Map<DiscussionPostSort, Promise<DiscussionPost[]>>();

async function loadApiDiscussionPosts(sort: DiscussionPostSort = 'recent'): Promise<DiscussionPost[]> {
  if (!API_BASE) return [];
  const existing = inflightBySort.get(sort);
  if (existing) return existing;
  const p = (async () => {
    try {
      const res = await fetch(`${API_BASE}/posts?sort=${encodeURIComponent(sort)}`);
      if (!res.ok) return [];
      const data = (await res.json()) as { posts?: Record<string, unknown>[] };
      return (data.posts ?? []).map(mapApiPost);
    } finally {
      inflightBySort.delete(sort);
    }
  })();
  inflightBySort.set(sort, p);
  return p;
}

export async function upvoteDiscussionPost(
  postId: string
): Promise<{ ok: boolean; upvotes?: number; error?: string }> {
  if (!API_BASE) {
    await simulateDelay(150);
    return { ok: true };
  }
  try {
    const voterId = ensureAnonymousVoterId();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (voterId) headers['X-Voter-Id'] = voterId;

    const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(postId)}/upvote`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      return { ok: false, error: (await res.text()) || 'Could not upvote' };
    }
    const data = (await res.json()) as { post?: { upvotes?: number } };
    return { ok: true, upvotes: data.post?.upvotes };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function getDiscussionPostById(id: string): Promise<DiscussionPost | null> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      if (!res.ok) return null;
      const data = (await res.json()) as { post?: Record<string, unknown> };
      if (!data.post) return null;
      return mapApiPost(data.post);
    } catch {
      return null;
    }
  }
  await simulateDelay(200);
  return mockDiscussionPosts.find((p) => p.id === id) ?? null;
}

export async function postAnonymousComment(
  postId: string,
  text: string
): Promise<{ ok: boolean; error?: string; comment?: DiscussionComment }> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        return { ok: false, error: (await res.text()) || 'Could not post comment' };
      }
      const data = (await res.json()) as { comment?: DiscussionComment };
      return { ok: true, comment: data.comment };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
    }
  }
  await simulateDelay(250);
  const comment: DiscussionComment = {
    id: `mock-comment-${Date.now()}`,
    postId,
    body: text,
    authorLabel: 'Anonymous',
    createdAt: new Date().toISOString(),
  };
  return { ok: true, comment };
}

/**
 * Get testimonial highlights with optional filtering
 * 
 * Current: Filters mock data in memory
 * Future: GET from API Gateway with query parameters
 */
function filterPostsForMap(posts: DiscussionPost[], filters?: MapFilters): DiscussionPost[] {
  if (!filters) return posts;
  return posts.filter((p) => {
    if (filters.careerStage && p.metadata.careerStage !== filters.careerStage) return false;
    if (filters.specialty && p.metadata.specialty !== filters.specialty) return false;
    if (filters.language && p.metadata.language !== filters.language) return false;
    if (filters.themeId && !postMatchesApiThemeId(p, filters.themeId)) return false;
    return true;
  });
}

function filterPostsForHighlights(posts: DiscussionPost[], filters?: HighlightFilters): DiscussionPost[] {
  if (!filters) return posts;
  return posts.filter((p) => {
    if (filters.country && p.metadata.country !== filters.country) return false;
    if (filters.careerStage && p.metadata.careerStage !== filters.careerStage) return false;
    if (filters.specialty && p.metadata.specialty !== filters.specialty) return false;
    if (filters.themeId && !postMatchesApiThemeId(p, filters.themeId)) return false;
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const blob = `${p.title} ${p.summary} ${p.body} ${p.tags.join(' ')}`.toLowerCase();
      if (!blob.includes(keyword)) return false;
    }
    return true;
  });
}

export async function getHighlights(filters?: HighlightFilters): Promise<Testimonial[]> {
  if (API_BASE) {
    const posts = await loadApiDiscussionPosts('recent');
    const filtered = filterPostsForHighlights(posts, filters);
    const highlights = filtered
      .map(discussionPostToHighlight)
      .filter((t): t is Testimonial => t != null);
    highlights.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    return highlights;
  }

  await simulateDelay();

  let results = [...mockTestimonials];

  if (filters) {
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      results = results.filter((t) => t.highlight.toLowerCase().includes(keyword));
    }
    if (filters.country) {
      results = results.filter((t) => t.metadata.country === filters.country);
    }
    if (filters.careerStage) {
      results = results.filter((t) => t.metadata.careerStage === filters.careerStage);
    }
    if (filters.specialty) {
      results = results.filter((t) => t.metadata.specialty === filters.specialty);
    }
    if (filters.themeId) {
      results = results.filter((t) => t.themeIds?.includes(filters.themeId!));
    }
  }

  results.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return results;
}

/**
 * Get map data points for globe visualization
 * 
 * Current: Transforms mock testimonials to map points
 * Future: GET from API Gateway with query parameters
 */
export async function getMapData(filters?: MapFilters): Promise<MapDataPoint[]> {
  if (API_BASE) {
    const posts = await loadApiDiscussionPosts('recent');
    const filtered = filterPostsForMap(posts, filters);
    const mapPoints = filtered
      .map(discussionPostToMapPoint)
      .filter((p): p is MapDataPoint => p != null);
    return mapPoints;
  }

  await simulateDelay();

  let testimonials = [...mockTestimonials];

  if (filters) {
    if (filters.careerStage) {
      testimonials = testimonials.filter((t) => t.metadata.careerStage === filters.careerStage);
    }
    if (filters.specialty) {
      testimonials = testimonials.filter((t) => t.metadata.specialty === filters.specialty);
    }
    if (filters.themeId) {
      testimonials = testimonials.filter((t) => t.themeIds?.includes(filters.themeId!));
    }
    if (filters.language) {
      testimonials = testimonials.filter((t) => t.metadata.language === filters.language);
    }
  }

  const postBySubmission = new Map(
    mockDiscussionPosts
      .filter((p) => p.sourceSubmissionId)
      .map((p) => [p.sourceSubmissionId as string, p.id])
  );

  return testimonials.map((t) => ({
    id: t.id,
    coordinates: t.coordinates,
    country: t.metadata.country,
    careerStage: t.metadata.careerStage,
    highlight: t.highlight,
    metadata: t.metadata,
    discussionPostId: postBySubmission.get(t.id),
  }));
}

/**
 * Get themes for categorization
 * 
 * Current: Returns mock themes
 * Future: GET from API Gateway
 */
export async function getThemes(): Promise<Theme[]> {
  if (API_BASE) {
    const posts = await loadApiDiscussionPosts('recent');
    return buildThemesFromPosts(posts);
  }

  await simulateDelay(300);
  return mockThemes;
}

/**
 * Get discussion posts for Explore forum tab
 *
 * Current: Returns mock discussion posts
 * Future: GET from API Gateway, include transcription status from processing pipeline
 */
export async function getDiscussionPosts(sort: DiscussionPostSort = 'recent'): Promise<DiscussionPost[]> {
  if (API_BASE) {
    try {
      return await loadApiDiscussionPosts(sort);
    } catch {
      return [];
    }
  }
  await simulateDelay(350);
  const list = [...mockDiscussionPosts];
  if (sort === 'upvotes') {
    list.sort((a, b) => b.upvotes - a.upvotes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return list;
}

/**
 * Get a single testimonial by ID
 * 
 * Current: Finds in mock data
 * Future: GET from API Gateway
 */
export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  await simulateDelay(200);
  
  const testimonial = mockTestimonials.find(t => t.id === id);
  
  /* 
   * Future AWS implementation:
   * 
   * const response = await fetch(`${API_BASE}/testimonials/${id}`);
   * if (!response.ok) return null;
   * return response.json();
   */
  
  return testimonial || null;
}
