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
  initialPostId?: string | null;
  onViewOnMap?: (payload: ViewOnMapPayload) => void;
  postSort: DiscussionPostSort;
  onPostSortChange: (sort: DiscussionPostSort) => void;
  onPostUpvoted?: (postId: string, upvotes: number) => void;
}
 
const SORT_OPTIONS: { value: DiscussionPostSort; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'upvotes', label: 'Top' },
  { value: 'title', label: 'A–Z' },
];
 
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
    if (userPickedId && filteredPosts.some((p) => p.id === userPickedId)) return userPickedId;
    if (initialPostId && filteredPosts.some((p) => p.id === initialPostId)) return initialPostId;
    return filteredPosts[0].id;
  }, [filteredPosts, initialPostId, userPickedId]);
 
  const selected = useMemo(
    () => filteredPosts.find((p) => p.id === selectedId) ?? filteredPosts[0] ?? null,
    [filteredPosts, selectedId]
  );
 
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
      .then((post) => { if (!cancelled) setDetailPost(post); })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId]);
 
  async function handleSubmitComment() {
    const id = selectedId;
    if (!id || !commentDraft.trim()) return;
    setCommentError(null);
    setCommentSending(true);
    try {
      const result = await postAnonymousComment(id, commentDraft.trim());
      if (!result.ok) { setCommentError(result.error ?? 'Could not post comment'); return; }
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
      const next =
        result.upvotes !== undefined && result.upvotes !== null
          ? result.upvotes
          : (current.upvotes ?? 0) + 1;
      onPostUpvoted?.(id, next);
      setDetailPost((prev) => (prev && prev.id === id ? { ...prev, upvotes: next } : prev));
    } finally {
      setUpvoting(false);
    }
  }
 
  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
 
      {/* ═══════════════════════════════════════
          LIST PANEL
      ═══════════════════════════════════════ */}
      <div className="flex w-full shrink-0 flex-col border-b border-white/10 lg:w-[320px] lg:border-b-0 lg:border-r lg:border-white/10">
 
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#38BDF8]">
              Voice threads
            </p>
            {!isLoading && (
              <span className="text-[11px] text-white/30">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'thread' : 'threads'}
              </span>
            )}
          </div>
 
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads, tags, places…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/20 focus:border-[#38BDF8]/40 focus:bg-white/[0.06] focus:outline-none transition-colors"
            />
          </div>
 
          {/* Sort pills */}
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onPostSortChange(value)}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
                  postSort === value
                    ? 'border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]'
                    : 'border-white/10 bg-transparent text-white/35 hover:border-white/20 hover:text-white/65'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
 
        {/* Thread list */}
        <div className="min-h-0 flex-1 overflow-y-auto py-2 px-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[84px] animate-pulse rounded-xl bg-white/[0.05]" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="m-2 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-white/30">No threads match your search.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredPosts.map((post) => {
                const active = selectedId === post.id;
                return (
                  <li key={post.id}>
                    <button
                      type="button"
                      onClick={() => setUserPickedId(post.id)}
                      className={`group w-full rounded-xl border px-3 py-3 text-left transition-all ${
                        active
                          ? 'border-[#38BDF8]/30 bg-[#38BDF8]/[0.06]'
                          : 'border-transparent hover:border-white/10 hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Title + status */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className={`text-sm font-medium leading-snug flex-1 ${
                          active ? 'text-[#7DD3FC]' : 'text-white/80 group-hover:text-white'
                        }`}>
                          {post.title}
                        </p>
                        <span className={`shrink-0 mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadge(post.transcriptionStatus)}`}>
                          {statusLabel(post.transcriptionStatus)}
                        </span>
                      </div>
 
                      {/* Summary */}
                      <p className="line-clamp-2 text-xs leading-relaxed text-white/35 mb-2">
                        {post.summary}
                      </p>
 
                      {/* Meta */}
                      <div className="flex items-center gap-1.5 text-[11px] text-white/25">
                        <span>{getCountryName(post.metadata.country)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {post.upvotes}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                          </svg>
                          {post.comments.length}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
 
      {/* ═══════════════════════════════════════
          DETAIL PANEL
      ═══════════════════════════════════════ */}
      <div className="flex min-h-[480px] min-w-0 flex-1 flex-col overflow-hidden">
        {!display ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-white/25">Select a thread to read the full summary and discussion.</p>
          </div>
        ) : (
          <>
            {detailLoading && (
              <div className="px-6 py-2 text-[11px] text-white/25 border-b border-white/10">
                Loading…
              </div>
            )}
 
            {/* Sticky header */}
            <div className="border-b border-white/10 px-6 py-5 shrink-0">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <h2 className="text-xl font-semibold leading-snug text-white flex-1 min-w-0">
                  {display.title}
                </h2>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/50 transition-all hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View on map
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleUpvote()}
                    disabled={upvoting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#38BDF8]/30 bg-[#38BDF8]/[0.07] px-3 py-1.5 text-xs font-medium text-[#7DD3FC] transition-all hover:bg-[#38BDF8]/15 disabled:opacity-40"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {upvoting ? '…' : `Upvote (${display.upvotes})`}
                  </button>
                </div>
              </div>
 
              <p className="text-sm leading-relaxed text-white/55 mb-3">
                {display.summary}
              </p>
 
              {display.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {display.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/[0.06] px-2.5 py-0.5 text-[11px] text-[#7DD3FC]/75"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
 
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-5">
 
                {/* Meta grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-3">
                      Submission
                    </p>
                    <dl className="space-y-2">
                      {([
                        { label: 'Region', value: getCountryName(display.metadata.country) },
                        { label: 'Stage', value: display.metadata.careerStage },
                        { label: 'Group', value: display.metadata.isGroupSubmission ? 'Yes' : 'No' },
                        display.metadata.specialty?.trim()
                          ? { label: 'Focus', value: getSpecialtyLabel(display.metadata.specialty) }
                          : null,
                        display.metadata.practiceSetting
                          ? { label: 'Setting', value: display.metadata.practiceSetting }
                          : null,
                      ] as ({ label: string; value: string } | null)[])
                        .filter((r): r is { label: string; value: string } => r !== null)
                        .map((row) => (
                          <div key={row.label} className="flex items-baseline justify-between gap-4">
                            <dt className="text-xs text-white/28 shrink-0">{row.label}</dt>
                            <dd className="text-xs text-white/60 text-right">{row.value}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
 
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-3">
                      Recording
                    </p>
                    {display.metadata.contributorIdentities?.trim() && (
                      <p className="text-xs text-white/50 leading-relaxed mb-3">
                        {display.metadata.contributorIdentities}
                      </p>
                    )}
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusBadge(display.transcriptionStatus)}`}>
                      {statusLabel(display.transcriptionStatus)}
                    </span>
                    <p className="mt-3 text-xs text-white/25 leading-relaxed">
                      {display.audioUrl ?? 'No audio linked in this row.'}
                    </p>
                  </div>
                </div>
 
                {/* Story excerpt */}
                {display.body?.trim() && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#38BDF8]/75">
                        Story excerpt
                      </p>
                      {display.transcriptText && (
                        <button
                          type="button"
                          onClick={() => setShowTranscript((v) => !v)}
                          className="text-[11px] text-white/30 hover:text-white/65 transition-colors"
                        >
                          {showTranscript ? 'Hide transcript' : 'Show transcript'}
                        </button>
                      )}
                    </div>
                    <p className="border-l-2 border-[#38BDF8]/25 pl-3 text-sm leading-relaxed text-white/60">
                      {display.body}
                    </p>
                    {showTranscript && display.transcriptText && (
                      <pre className="mt-4 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-white/30">
                        {display.transcriptText}
                      </pre>
                    )}
                    {showTranscript && !display.transcriptText && (
                      <p className="mt-3 text-xs italic text-white/25">
                        Transcript will appear here after processing completes.
                      </p>
                    )}
                  </div>
                )}
 
                {/* Discussion */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/28 mb-3">
                    Discussion ({display.comments.length})
                  </p>
 
                  {display.comments.length === 0 && (
                    <p className="text-xs text-white/25 mb-4">
                      No comments yet — start the discussion below.
                    </p>
                  )}
 
                  {display.comments.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {display.comments.map((comment) => (
                        <li key={comment.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          <p className="text-[11px] font-medium text-[#38BDF8]/75 mb-1">{comment.authorLabel}</p>
                          <p className="text-sm text-white/55 leading-relaxed">{comment.body}</p>
                          <p className="mt-2 text-[10px] text-white/22">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
 
                  {/* Compose */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      rows={3}
                      maxLength={4000}
                      placeholder="Add a thoughtful reply…"
                      className="w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/18 focus:border-[#38BDF8]/35 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/15 transition-colors"
                    />
                    {commentError && <p className="mt-2 text-xs text-red-400">{commentError}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[11px] text-white/22">Anonymous · be respectful</p>
                      <button
                        type="button"
                        onClick={() => void handleSubmitComment()}
                        disabled={commentSending || !commentDraft.trim()}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-30"
                      >
                        {commentSending ? 'Posting…' : 'Post anonymously'}
                      </button>
                    </div>
                  </div>
                </div>
 
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function getCountryName(code: string): string {
  return countries.find((c) => c.code === code)?.name ?? code;
}
 
function getSpecialtyLabel(value: string | undefined): string {
  if (!value?.trim()) return '';
  return specialties.find((s) => s.value === value)?.label ?? value;
}
 
function statusLabel(status: DiscussionPost['transcriptionStatus']): string {
  if (status === 'pending') return 'Queued';
  if (status === 'processing') return 'Transcribing';
  if (status === 'failed') return 'Failed';
  return 'Ready';
}
 
function statusBadge(status: DiscussionPost['transcriptionStatus']): string {
  if (status === 'completed') return 'border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400';
  if (status === 'processing') return 'border-amber-500/25 bg-amber-500/[0.07] text-amber-300';
  if (status === 'failed') return 'border-red-500/25 bg-red-500/[0.07] text-red-400';
  return 'border-white/10 bg-white/[0.04] text-white/35';
}
