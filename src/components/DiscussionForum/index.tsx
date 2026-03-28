'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Coordinates, DiscussionPost, DiscussionPostSort } from '@/lib/types';
import { countries, specialties } from '@/lib/mockData';
import { getDiscussionPostById, postAnonymousComment, upvoteDiscussionPost } from '@/lib/api';

export interface ViewOnMapPayload {
  coordinates: Coordinates;
  submissionId?: string;
  discussionPostId: string;
}

interface DiscussionForumProps {
  posts: DiscussionPost[];
  isLoading?: boolean;
  /** When user opens a thread from the map tab, focus this post */
  initialPostId?: string | null;
  onViewOnMap?: (payload: ViewOnMapPayload) => void;
  postSort: DiscussionPostSort;
  onPostSortChange: (sort: DiscussionPostSort) => void;
  onPostUpvoted?: (postId: string, upvotes: number) => void;
}

export default function DiscussionForum({
  posts,
  isLoading = false,
  initialPostId = null,
  onViewOnMap,
  postSort,
  onPostSortChange,
  onPostUpvoted,
}: DiscussionForumProps) {
  const [query, setQuery] = useState('');
  const [userPickedId, setUserPickedId] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const [detailPost, setDetailPost] = useState<DiscussionPost | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSending, setCommentSending] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return posts;
    const normalized = query.toLowerCase();
    return posts.filter((post) => {
      const countryName = getCountryName(post.metadata.country).toLowerCase();
      const specialty = getSpecialtyLabel(post.metadata.specialty).toLowerCase();
      const tagText = post.tags.join(' ').toLowerCase();
      return (
        post.title.toLowerCase().includes(normalized) ||
        post.summary.toLowerCase().includes(normalized) ||
        post.body.toLowerCase().includes(normalized) ||
        tagText.includes(normalized) ||
        countryName.includes(normalized) ||
        specialty.includes(normalized)
      );
    });
  }, [posts, query]);

  const selectedId = useMemo(() => {
    if (filteredPosts.length === 0) return null;
    if (userPickedId && filteredPosts.some((p) => p.id === userPickedId)) {
      return userPickedId;
    }
    if (initialPostId && filteredPosts.some((p) => p.id === initialPostId)) {
      return initialPostId;
    }
    return filteredPosts[0].id;
  }, [filteredPosts, initialPostId, userPickedId]);

  const selected = useMemo(
    () => filteredPosts.find((p) => p.id === selectedId) ?? filteredPosts[0] ?? null,
    [filteredPosts, selectedId]
  );

  /** List row + optional fresh detail from API (same id). */
  const display = useMemo(() => {
    if (!selected) return null;
    if (detailPost && detailPost.id === selected.id) return detailPost;
    return selected;
  }, [selected, detailPost]);

  useEffect(() => {
    setCommentError(null);
    setCommentDraft('');
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetailPost(null);
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void getDiscussionPostById(selectedId)
      .then((post) => {
        if (cancelled) return;
        setDetailPost(post);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleSubmitComment() {
    const id = selectedId;
    if (!id || !commentDraft.trim()) return;
    setCommentError(null);
    setCommentSending(true);
    try {
      const result = await postAnonymousComment(id, commentDraft.trim());
      if (!result.ok) {
        setCommentError(result.error ?? 'Could not post comment');
        return;
      }
      if (result.comment) {
        setDetailPost((prev) => {
          const base = prev && prev.id === id ? prev : selected;
          if (!base) return prev;
          return { ...base, comments: [...base.comments, result.comment!] };
        });
        setCommentDraft('');
      }
    } catch {
      setCommentError('Could not post comment');
    } finally {
      setCommentSending(false);
    }
  }

  async function handleUpvote() {
    const id = selectedId;
    if (!id || upvoting) return;
    const current = detailPost?.id === id ? detailPost : selected;
    if (!current) return;
    setUpvoting(true);
    try {
      const result = await upvoteDiscussionPost(id);
      if (!result.ok) return;
      const base = current.upvotes ?? 0;
      const next = result.upvotes !== undefined && result.upvotes !== null ? result.upvotes : base + 1;
      onPostUpvoted?.(id, next);
      setDetailPost((prev) => (prev && prev.id === id ? { ...prev, upvotes: next } : prev));
    } finally {
      setUpvoting(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-black/40 lg:flex-row">
      {/* List */}
      <div className="flex w-full shrink-0 flex-col border-b border-white/10 lg:w-[min(100%,380px)] lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 bg-black/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#38BDF8]">
            From voice notes
          </p>
          <p className="mt-1 text-sm text-white/70">
            Each post is a titled summary from a submitted recording. Threads continue below the map marker for that submission.
          </p>
          <div className="mt-4 rounded-xl border border-[#38BDF8]/25 bg-[#38BDF8]/[0.06] p-3">
            <p className="text-xs font-medium text-white">Pipeline (AWS-ready)</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/55">
              Upload audio to S3 → Transcribe → LLM title &amp; summary → store thread → geolocation drives the globe pin.
            </p>
          </div>
          <div className="relative mt-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, summary, tags, place..."
              className="w-full rounded-lg border border-white/15 bg-black/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/35 focus:border-[#38BDF8]/50 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/30"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <div className="mt-3">
            <label className="sr-only" htmlFor="discussion-sort">
              Sort posts
            </label>
            <select
              id="discussion-sort"
              value={postSort}
              onChange={(e) => onPostSortChange(e.target.value as DiscussionPostSort)}
              className="w-full rounded-lg border border-white/15 bg-black/60 py-2.5 px-3 text-sm text-white focus:border-[#38BDF8]/50 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/30"
            >
              <option value="recent">Most recent</option>
              <option value="upvotes">Most upvotes</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </div>
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-white/[0.06]" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="m-2 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <p className="text-sm text-white/60">No threads match your search.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredPosts.map((post) => {
                const active = selectedId === post.id;
                return (
                  <li key={post.id}>
                    <button
                      type="button"
                      onClick={() => setUserPickedId(post.id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                        active
                          ? 'border-[#38BDF8]/45 bg-white/[0.08]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-white">{post.title}</p>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadge(post.transcriptionStatus)}`}
                        >
                          {statusLabel(post.transcriptionStatus)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-white/50">{post.summary}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/40">
                        <span>{getCountryName(post.metadata.country)}</span>
                        <span>·</span>
                        <span>{post.upvotes} upvotes</span>
                        <span>·</span>
                        <span>{post.comments.length} comments</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="flex min-h-[420px] min-w-0 flex-1 flex-col bg-black/30">
        {!display ? (
          <div className="flex flex-1 items-center justify-center p-8 text-white/45">
            Select a thread to read the summary, transcript, and discussion.
          </div>
        ) : (
          <>
            {detailLoading && (
              <div className="border-b border-white/10 px-5 py-2 text-[11px] text-white/40">
                Loading thread…
              </div>
            )}
            <div className="border-b border-white/10 bg-black/40 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">{display.title}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">{display.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {display.coordinates && onViewOnMap && (
                    <button
                      type="button"
                      onClick={() =>
                        onViewOnMap({
                          coordinates: display.coordinates as Coordinates,
                          submissionId: display.sourceSubmissionId,
                          discussionPostId: display.id,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-xs font-medium text-white hover:bg-white hover:text-black"
                    >
                      View on map
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleUpvote()}
                    disabled={upvoting}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#38BDF8]/35 bg-[#38BDF8]/10 px-3 py-2 text-xs font-medium text-[#7DD3FC] transition-colors hover:bg-[#38BDF8]/20 disabled:opacity-50"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {upvoting ? '…' : `Upvote (${display.upvotes})`}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {display.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[#38BDF8]/25 bg-[#38BDF8]/10 px-2 py-0.5 text-[11px] text-[#7DD3FC]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Submission</p>
                  <dl className="mt-2 space-y-1 text-xs text-white/65">
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-white/40">Group</dt>
                      <dd className="text-right">{display.metadata.isGroupSubmission ? 'Yes' : '—'}</dd>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <dt className="text-white/40">Speakers</dt>
                      <dd className="text-right sm:max-w-[65%]">
                        {display.metadata.contributorIdentities?.trim() || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-white/40">Region</dt>
                      <dd>{getCountryName(display.metadata.country)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-white/40">Stage</dt>
                      <dd>{display.metadata.careerStage}</dd>
                    </div>
                    {display.metadata.specialty?.trim() ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-white/40">Focus</dt>
                        <dd>{getSpecialtyLabel(display.metadata.specialty)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-2">
                      <dt className="text-white/40">Setting</dt>
                      <dd className="text-right">{display.metadata.practiceSetting}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Recording</p>
                  <p className="mt-2 text-xs text-white/55">
                    {display.audioUrl
                      ? 'Audio key stored with the post (mock S3 URI shown in dev).'
                      : 'No audio linked in this mock row.'}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-white/35 break-all">{display.audioUrl ?? '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#38BDF8]">Story excerpt</p>
                  <button
                    type="button"
                    onClick={() => setShowTranscript((value) => !value)}
                    className="text-[11px] font-medium text-white/55 hover:text-white"
                  >
                    {showTranscript ? 'Hide transcript' : 'Show transcript'}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{display.body}</p>
                {showTranscript && display.transcriptText && (
                  <pre className="mt-4 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-white/55">
                    {display.transcriptText}
                  </pre>
                )}
                {showTranscript && !display.transcriptText && (
                  <p className="mt-4 text-xs italic text-white/40">
                    Transcript will appear here after Transcribe completes.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
                  Discussion ({display.comments.length})
                </p>
                <ul className="mt-3 space-y-3">
                  {display.comments.map((comment) => (
                    <li
                      key={comment.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <p className="text-[11px] text-[#38BDF8]">{comment.authorLabel}</p>
                      <p className="mt-1 text-sm text-white/75">{comment.body}</p>
                      <p className="mt-2 text-[10px] text-white/35">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[11px] text-white/50">
                    Public anonymous comments for now. Be respectful; repeated abuse may be removed.
                  </p>
                  <textarea
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    rows={3}
                    maxLength={4000}
                    placeholder="Add a thoughtful reply…"
                    className="mt-3 w-full resize-y rounded-lg border border-white/15 bg-black/40 p-3 text-sm text-white placeholder:text-white/30 focus:border-[#38BDF8]/50 focus:outline-none"
                  />
                  {commentError && <p className="mt-2 text-xs text-red-400">{commentError}</p>}
                  <button
                    type="button"
                    onClick={() => void handleSubmitComment()}
                    disabled={commentSending || !commentDraft.trim()}
                    className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
                  >
                    {commentSending ? 'Posting…' : 'Post anonymously'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getCountryName(code: string): string {
  return countries.find((country) => country.code === code)?.name ?? code;
}

function getSpecialtyLabel(value: string | undefined): string {
  if (!value?.trim()) return '';
  return specialties.find((specialty) => specialty.value === value)?.label ?? value;
}

function statusLabel(status: DiscussionPost['transcriptionStatus']): string {
  if (status === 'pending') return 'Queued';
  if (status === 'processing') return 'Transcribing';
  if (status === 'failed') return 'Failed';
  return 'Ready';
}

function statusBadge(status: DiscussionPost['transcriptionStatus']): string {
  if (status === 'completed') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (status === 'processing') return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
  if (status === 'failed') return 'border-red-400/30 bg-red-400/10 text-red-200';
  return 'border-white/20 bg-white/5 text-white/60';
}
