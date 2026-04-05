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

  const filteredHighlights = useMemo(() => {
    if (!searchQuery.trim()) return highlights;
    const query = searchQuery.toLowerCase();
    return highlights.filter((h) => {
      const spec = (h.metadata.specialty ?? '').toLowerCase();
      return (
        h.highlight.toLowerCase().includes(query) ||
        spec.includes(query) ||
        h.metadata.country.toLowerCase().includes(query)
      );
    });
  }, [highlights, searchQuery]);

  const getCountryName = (code: string) =>
    countries.find((c) => c.code === code)?.name || code;
  const getSpecialtyName = (value: string) =>
    specialties.find((s) => s.value === value)?.label || value;

  return (
    <div className="flex flex-col h-full">

      {/* Search Bar */}
      <div className="px-4 pt-3 pb-3 border-b border-slate-800/60">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by keyword, country, specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Highlights List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl animate-pulse"
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.3)' }}
            >
              <div className="h-3 bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-full mb-2" />
              <div className="h-3 bg-slate-700/50 rounded w-1/2" />
            </div>
          ))
        ) : filteredHighlights.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-10 h-10 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400 text-sm">No highlights found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredHighlights.map((highlight) => {
            const isSelected = selectedId === highlight.id;
            return (
              <button
                key={highlight.id}
                onClick={() => onHighlightClick(highlight)}
                className="w-full text-left rounded-xl transition-all duration-200 group"
                style={{
                  background: isSelected
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'rgba(15, 23, 42, 0.7)',
                  border: isSelected
                    ? '1px solid rgba(59, 130, 246, 0.4)'
                    : '1px solid rgba(51, 65, 85, 0.4)',
                  boxShadow: isSelected
                    ? '0 0 12px rgba(59, 130, 246, 0.1)'
                    : 'none',
                }}
              >
                <div className="p-3.5">
                  {/* Country + Stage row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCareerStageColor(highlight.metadata.careerStage) }}
                    />
                    <span className="text-xs font-medium text-slate-300">
                      {getCountryName(highlight.metadata.country)}
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-500">{highlight.metadata.careerStage}</span>
                  </div>

                  {/* Quote */}
                  <p className="text-slate-200 text-sm leading-relaxed mb-3 group-hover:text-white transition-colors">
                    &ldquo;{highlight.highlight}&rdquo;
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {highlight.metadata.specialty?.trim() ? (
                      <span className="px-2 py-0.5 rounded-md text-xs text-blue-300 bg-blue-500/10 border border-blue-500/15">
                        {getSpecialtyName(highlight.metadata.specialty)}
                      </span>
                    ) : null}
                    <span className="px-2 py-0.5 rounded-md text-xs text-slate-400 bg-slate-800/60 border border-slate-700/40">
                      {highlight.metadata.practiceSetting}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <p className="mt-2 text-xs text-slate-600">
                    {new Date(highlight.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Count */}
      {!isLoading && filteredHighlights.length > 0 && (
        <div
          className="px-4 py-2.5 border-t border-slate-800/60"
          style={{ background: 'rgba(10, 15, 25, 0.6)' }}
        >
          <p className="text-xs text-slate-600 text-center">
            Showing {filteredHighlights.length} of {highlights.length} experiences
          </p>
        </div>
      )}
    </div>
  );
}

function getCareerStageColor(stage: string): string {
  switch (stage) {
    case 'Trainee':      return '#22d3ee';
    case 'Early-career': return '#34d399';
    case 'Mid-career':   return '#fbbf24';
    case 'Senior':       return '#a78bfa';
    default:             return '#64748b';
  }
}
