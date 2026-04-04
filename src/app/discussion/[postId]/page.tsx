'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDiscussionPostById, postAnonymousComment, upvoteDiscussionPost } from '@/lib/api';
import type { DiscussionPost } from '@/lib/types';
import BackgroundGlobe from '@/components/BackgroundGlobe';
import DiscussionSubmissionMeta from '@/components/DiscussionSubmissionMeta';
import { countries } from '@/lib/mockData';

export default function DiscussionPostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = decodeURIComponent(params.postId);

  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentDraft, setCommentDraft] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void getDiscussionPostById(postId)
      .then((result) => {
        if (!cancelled) setPost(result);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleCommentSubmit() {
    if (!post || !commentDraft.trim()) return;
    setIsCommenting(true);
    setCommentError(null);
    try {
      const result = await postAnonymousComment(post.id, commentDraft.trim());
      if (!result.ok) {
        setCommentError(result.error ?? 'Could not post comment');
        return;
      }
      if (result.comment) {
        setPost((prev) => (prev ? { ...prev, comments: [...prev.comments, result.comment!] } : prev));
        setCommentDraft('');
      }
    } catch {
      setCommentError('Could not post comment');
    } finally {
      setIsCommenting(false);
    }
  }

  async function handleUpvote() {
    if (!post || isUpvoting) return;
    setIsUpvoting(true);
    try {
      const result = await upvoteDiscussionPost(post.id);
      if (!result.ok) return;
      const next = result.upvotes ?? post.upvotes + 1;
      setPost((prev) => (prev ? { ...prev, upvotes: next } : prev));
    } finally {
      setIsUpvoting(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <BackgroundGlobe />
        <div className="relative z-10 min-h-screen pt-24 pb-10">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md" />
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <BackgroundGlobe />
        <div className="relative z-10 min-h-screen pt-24 pb-10">
          <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
            <div className="rounded-2xl border border-white/10 bg-black/45 px-5 py-8 backdrop-blur-md">
              <p className="mb-4 text-white/70">This post could not be found.</p>
              <Link href="/discussion" className="text-sm text-[#7DD3FC] hover:text-[#BAE6FD]">
                Back to discussion feed
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundGlobe />
      <div className="relative z-10 min-h-screen pt-24 pb-10">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="mb-4 flex items-center gap-3 text-sm">
            <button type="button" onClick={() => router.back()} className="text-white/70 hover:text-white">
              Back
            </button>
            <span className="text-white/30">/</span>
            <Link href="/discussion" className="text-white/70 hover:text-white">
              All posts
            </Link>
          </div>

          <article className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md sm:p-6">
            <p className="text-xs text-white/50">
              {countryLabel(post.metadata.country)} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{post.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{post.summary}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => void handleUpvote()}
                disabled={isUpvoting}
                className="rounded-lg border border-[#38BDF8]/30 bg-[#38BDF8]/[0.07] px-3 py-2 text-[#7DD3FC] hover:bg-[#38BDF8]/15 disabled:opacity-50"
              >
                {isUpvoting ? 'Upvoting...' : `Upvote (${post.upvotes})`}
              </button>
              <span className="text-white/60">{post.comments.length} comments</span>
            </div>

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/[0.06] px-2.5 py-1 text-xs text-[#7DD3FC]/75"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6">
              <DiscussionSubmissionMeta
                metadata={post.metadata}
                transcriptionStatus={post.transcriptionStatus}
                audioUrl={post.audioUrl}
                variant="page"
              />
            </div>

            {post.body?.trim() && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#38BDF8]/75">
                    Story excerpt
                  </p>
                  {post.transcriptText && (
                    <button
                      type="button"
                      onClick={() => setShowTranscript((v) => !v)}
                      className="text-[11px] text-white/40 transition-colors hover:text-white/70"
                    >
                      {showTranscript ? 'Hide transcript' : 'Show transcript'}
                    </button>
                  )}
                </div>
                <p className="border-l-2 border-[#38BDF8]/25 pl-3 text-sm leading-relaxed text-white/70">
                  {post.body}
                </p>
                {showTranscript && post.transcriptText && (
                  <pre className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-white/35">
                    {post.transcriptText}
                  </pre>
                )}
                {showTranscript && !post.transcriptText && (
                  <p className="mt-3 text-xs italic text-white/30">
                    Transcript will appear here after processing completes.
                  </p>
                )}
              </div>
            )}
          </article>

          <section className="mt-4 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md sm:p-6">
            <h2 className="text-base font-semibold text-white">Comments</h2>
            {post.comments.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">No comments yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {post.comments.map((comment) => (
                  <li key={comment.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
                    <p className="text-[11px] font-medium text-[#38BDF8]/75">{comment.authorLabel}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/80">{comment.body}</p>
                    <p className="mt-2 text-xs text-white/40">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={3}
                maxLength={4000}
                placeholder="Add a thoughtful reply…"
                className="w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/25 focus:border-[#38BDF8]/35 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/15"
              />
              {commentError && <p className="mt-2 text-xs text-red-400">{commentError}</p>}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-white/25">Anonymous · be respectful</p>
                <button
                  type="button"
                  onClick={() => void handleCommentSubmit()}
                  disabled={isCommenting || !commentDraft.trim()}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  {isCommenting ? 'Posting…' : 'Post anonymously'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function countryLabel(code: string): string {
  return countries.find((country) => country.code === code)?.name ?? code;
}
