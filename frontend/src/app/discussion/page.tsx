'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import BackgroundGlobe from '@/components/BackgroundGlobe';
import type { DiscussionPost, DiscussionPostSort } from '@/lib/types';
import { getDiscussionPosts } from '@/lib/api';
import { countries, specialties } from '@/lib/mockData';

export default function DiscussionPage() {
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [postSort, setPostSort] = useState<DiscussionPostSort>('recent');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const discussionPostsResult = await getDiscussionPosts(postSort);
        setDiscussionPosts(discussionPostsResult);
      } catch (error) {
        console.error('Failed to fetch discussion posts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [postSort]);

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return discussionPosts;
    const normalized = query.toLowerCase();
    return discussionPosts.filter((post) => {
      const countryName = countryLabel(post.metadata.country).toLowerCase();
      const specialty = specialtyLabel(post.metadata.specialty).toLowerCase();
      return (
        post.title.toLowerCase().includes(normalized) ||
        post.summary.toLowerCase().includes(normalized) ||
        post.body.toLowerCase().includes(normalized) ||
        post.tags.join(' ').toLowerCase().includes(normalized) ||
        countryName.includes(normalized) ||
        specialty.includes(normalized)
      );
    });
  }, [discussionPosts, query]);

  return (
    <>
      <BackgroundGlobe />
      <div className="relative z-10 min-h-screen pt-28">
        <section className="border-y border-white/10 bg-black/60 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#38BDF8]">
              MIT Critical Data · Discussion
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              Discussion Threads
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
              Browse threads and open a post to join the conversation.
            </p>
          </div>
        </section>

        <section className="bg-black/50 pb-10 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-6 lg:py-8">
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-4 rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search posts"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#38BDF8]/40 focus:outline-none"
                  />
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-white/65">Sort</span>
                    <select
                      value={postSort}
                      onChange={(e) => setPostSort(e.target.value as DiscussionPostSort)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-white focus:border-[#38BDF8]/40 focus:outline-none"
                    >
                      <option value="recent">Recent</option>
                      <option value="upvotes">Top</option>
                      <option value="title">A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md" />
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-8 text-center text-sm text-white/65 backdrop-blur-md">
                  No posts match your search.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map((post) => {
                    const focus = specialtyLabel(post.metadata.specialty);
                    return (
                    <Link
                      key={post.id}
                      href={`/discussion/${encodeURIComponent(post.id)}`}
                      className="block rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md transition-all hover:border-white/25 hover:bg-black/55"
                    >
                      <div className="flex gap-4">
                        <div className="flex w-12 shrink-0 flex-col items-center justify-start pt-1 text-xs text-white/60">
                          <span className="text-base font-semibold text-white">{post.upvotes}</span>
                          <span>upvotes</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white/50">
                            {countryLabel(post.metadata.country)} · {timeAgo(post.createdAt)}
                          </p>
                          <h2 className="mt-1 line-clamp-2 text-base font-semibold text-white sm:text-lg">
                            {post.title}
                          </h2>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/70">{post.summary}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/55">
                            {focus ? <span className="text-[#7DD3FC]/80">{focus}</span> : null}
                            <span>{post.comments.length} comments</span>
                            {post.tags.length > 0 && <span>#{post.tags[0]}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function countryLabel(code: string): string {
  return countries.find((country) => country.code === code)?.name ?? code;
}

function specialtyLabel(value: string | undefined): string {
  if (!value?.trim()) return '';
  return specialties.find((s) => s.value === value)?.label ?? value;
}

function timeAgo(dateIso: string): string {
  const date = new Date(dateIso).getTime();
  if (Number.isNaN(date)) return 'recently';
  const diff = Date.now() - date;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))}m ago`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))}h ago`;
  return `${Math.max(1, Math.round(diff / day))}d ago`;
}
