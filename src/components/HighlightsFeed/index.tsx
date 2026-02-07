'use client';

import { useState, useMemo } from 'react';
import type { Testimonial } from '@/lib/types';
import { countries, languages, specialties } from '@/lib/mockData';

interface HighlightsFeedProps {
  highlights: Testimonial[];
  selectedId?: string | null;
  onHighlightClick: (testimonial: Testimonial) => void;
  isLoading?: boolean;
}

export default function HighlightsFeed({
  highlights,
  selectedId,
  onHighlightClick,
  isLoading = false,
}: HighlightsFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter highlights based on search
  const filteredHighlights = useMemo(() => {
    if (!searchQuery.trim()) return highlights;
    
    const query = searchQuery.toLowerCase();
    return highlights.filter((h) =>
      h.highlight.toLowerCase().includes(query) ||
      h.metadata.specialty.toLowerCase().includes(query) ||
      h.metadata.country.toLowerCase().includes(query)
    );
  }, [highlights, searchQuery]);

  // Get display names
  const getCountryName = (code: string) =>
    countries.find((c) => c.code === code)?.name || code;
  const getLanguageName = (code: string) =>
    languages.find((l) => l.code === code)?.name || code;
  const getSpecialtyName = (value: string) =>
    specialties.find((s) => s.value === value)?.label || value;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search highlights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Highlights List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 animate-pulse"
            >
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-700/50 rounded w-1/2" />
            </div>
          ))
        ) : filteredHighlights.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-slate-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-400">No highlights found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredHighlights.map((highlight) => (
            <button
              key={highlight.id}
              onClick={() => onHighlightClick(highlight)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                selectedId === highlight.id
                  ? 'bg-blue-500/20 border-2 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              {/* Quote */}
              <p className="text-slate-200 text-sm leading-relaxed mb-3">
                &ldquo;{highlight.highlight}&rdquo;
              </p>

              {/* Metadata Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 text-xs">
                  {getCountryName(highlight.metadata.country)}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 text-xs">
                  {highlight.metadata.careerStage}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 text-xs">
                  {getSpecialtyName(highlight.metadata.specialty)}
                </span>
              </div>

              {/* Timestamp */}
              <div className="mt-2 text-xs text-slate-500">
                {new Date(highlight.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Results Count */}
      {!isLoading && filteredHighlights.length > 0 && (
        <div className="p-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {filteredHighlights.length} of {highlights.length} experiences
          </p>
        </div>
      )}
    </div>
  );
}
