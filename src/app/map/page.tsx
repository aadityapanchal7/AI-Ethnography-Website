'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import BackgroundGlobe from '@/components/BackgroundGlobe';
import HighlightsFeed from '@/components/HighlightsFeed';
import ThemesPanel from '@/components/ThemesPanel';
import type { Testimonial, Theme, MapDataPoint } from '@/lib/types';
import { getHighlights, getMapData, getThemes } from '@/lib/api';
import { countries, languages, specialties } from '@/lib/mockData';
import type { GlobeHandle } from '@/components/Globe';

const Globe = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-2xl">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-400">Loading globe...</p>
      </div>
    </div>
  ),
});

type TabType = 'highlights' | 'themes';

export default function MapPage() {
  const globeRef = useRef<GlobeHandle>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [highlights, setHighlights] = useState<Testimonial[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<MapDataPoint | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('highlights');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const mapFilters = selectedThemeId ? { themeId: selectedThemeId } : undefined;
        const [mapDataResult, highlightsResult, themesResult] = await Promise.all([
          getMapData(mapFilters),
          getHighlights(mapFilters),
          getThemes(),
        ]);
        setMapData(mapDataResult);
        setHighlights(highlightsResult);
        setThemes(themesResult);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedThemeId]);

  useEffect(() => {
    if (!mapData.length) return;
    const submissionId = searchParams.get('submission');
    const discussionPostId = searchParams.get('discussion');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    const bySubmission = submissionId ? mapData.find((p) => p.id === submissionId) : undefined;
    const byDiscussion = discussionPostId
      ? mapData.find((p) => p.discussionPostId === discussionPostId)
      : undefined;
    const point = byDiscussion ?? bySubmission;

    if (point) {
      setSelectedPoint(point);
      setIsSidebarOpen(true);
      globeRef.current?.flyTo(point.coordinates.lat, point.coordinates.lng);
      return;
    }

    if (lat && lng) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);
      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
        globeRef.current?.flyTo(parsedLat, parsedLng);
      }
    }
  }, [mapData, searchParams]);

  const handlePointClick = useCallback((point: MapDataPoint) => {
    setSelectedPoint(point);
    setIsSidebarOpen(true);
  }, []);

  const handleHighlightClick = useCallback((testimonial: Testimonial) => {
    const point = mapData.find((p) => p.id === testimonial.id);
    if (point) {
      setSelectedPoint(point);
      setIsSidebarOpen(true);
      globeRef.current?.flyTo(point.coordinates.lat, point.coordinates.lng);
    }
  }, [mapData]);

  const handleThemeClick = useCallback((theme: Theme) => {
    if (theme.id === selectedThemeId || !theme.id) {
      setSelectedThemeId(null);
    } else {
      setSelectedThemeId(theme.id);
    }
  }, [selectedThemeId]);

  const handleCloseDetail = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  const handleOpenDiscussionFromMap = useCallback((postId: string) => {
    router.push(`/discussion?post=${encodeURIComponent(postId)}`);
  }, [router]);

  const getCountryName = (code: string) =>
    countries.find((c) => c.code === code)?.name || code;
  const getLanguageName = (code: string) =>
    languages.find((l) => l.code === code)?.name || code;
  const getSpecialtyName = (value: string) =>
    specialties.find((s) => s.value === value)?.label || value;

  return (
    <>
      <BackgroundGlobe />

      <div className="relative z-10 min-h-screen pt-28">
        <section className="bg-black/60 backdrop-blur-md border-y border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-3">
              MIT Critical Data · Map
            </p>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Global Stories Map
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/60 max-w-2xl">
                Explore stories by location, themes, and participant perspectives.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-black/50 backdrop-blur-sm pb-10">
          <div className="max-w-7xl mx-auto px-6 py-6 lg:py-8">
            <div className="grid min-h-[min(92dvh,920px)] grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-black/55 lg:grid-cols-[1fr_400px]">
              <div className="relative min-h-[340px] lg:min-h-0">
                <Globe
                  ref={globeRef}
                  data={mapData}
                  onPointClick={handlePointClick}
                  selectedPointId={selectedPoint?.id}
                />
              </div>

              <aside
                className={`flex w-full flex-col transition-transform duration-300 lg:w-auto lg:min-h-0 ${
                  isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
                } fixed bottom-0 left-0 right-0 z-40 h-[min(78dvh,640px)] rounded-t-2xl lg:relative lg:z-0 lg:h-auto lg:max-h-none lg:rounded-none`}
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.82) 100%)',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="lg:hidden flex justify-center py-2 border-b border-white/10">
                  <div className="w-12 h-1 rounded-full bg-slate-500" />
                </div>

                <div className="px-4 py-3 border-b border-white/10 bg-black/30">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white font-semibold text-sm tracking-wide">
                      {selectedPoint ? 'Story Detail' : 'Explore Stories'}
                    </h2>
                    {!isLoading && !selectedPoint && (
                      <span className="text-xs text-white/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {highlights.length} voices
                      </span>
                    )}
                  </div>

                  {!selectedPoint && (
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                      <button
                        onClick={() => setActiveTab('highlights')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                          activeTab === 'highlights'
                            ? 'bg-white text-black'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Highlights
                      </button>
                      <button
                        onClick={() => setActiveTab('themes')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                          activeTab === 'themes'
                            ? 'bg-white text-black'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Themes
                      </button>
                    </div>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                  {selectedPoint ? (
                    <PointDetailPanel
                      point={selectedPoint}
                      onClose={handleCloseDetail}
                      getCountryName={getCountryName}
                      getLanguageName={getLanguageName}
                      getSpecialtyName={getSpecialtyName}
                      discussionPostId={selectedPoint.discussionPostId}
                      onOpenDiscussion={handleOpenDiscussionFromMap}
                    />
                  ) : activeTab === 'highlights' ? (
                    <HighlightsFeed
                      highlights={highlights}
                      selectedId={null}
                      onHighlightClick={handleHighlightClick}
                      isLoading={isLoading}
                    />
                  ) : (
                    <div className="h-full overflow-y-auto">
                      <ThemesPanel
                        themes={themes}
                        selectedThemeId={selectedThemeId}
                        onThemeClick={handleThemeClick}
                        isLoading={isLoading}
                      />
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

function PointDetailPanel({
  point,
  onClose,
  getCountryName,
  getLanguageName,
  getSpecialtyName,
  discussionPostId,
  onOpenDiscussion,
}: {
  point: MapDataPoint;
  onClose: () => void;
  getCountryName: (code: string) => string;
  getLanguageName: (code: string) => string;
  getSpecialtyName: (value: string) => string;
  discussionPostId?: string;
  onOpenDiscussion?: (postId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: getCareerStageColor(point.careerStage) + '30',
              color: getCareerStageColor(point.careerStage),
            }}
          >
            {point.country}
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              {getCountryName(point.country)}
            </p>
            <p className="mt-0.5 text-xs text-white/45">{point.careerStage}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Back to feed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="relative rounded-r-xl border-l-2 border-[#38BDF8] bg-white/[0.04] py-3 pl-4 pr-3">
          <p className="text-sm italic leading-relaxed text-white/80">
            &ldquo;{point.highlight}&rdquo;
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Coordinates
          </p>
          <p className="mt-1 font-mono text-xs text-[#38BDF8]">
            {point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Details</p>
          <div className="flex flex-wrap gap-2">
            {point.metadata.specialty?.trim() ? (
              <span className="rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2.5 py-1 text-xs text-[#7DD3FC]">
                {getSpecialtyName(point.metadata.specialty)}
              </span>
            ) : (
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/60">
                Group voice
              </span>
            )}
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/70">
              {getLanguageName(point.metadata.language)}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/70">
              {point.metadata.practiceSetting}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Career stage</p>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getCareerStageColor(point.careerStage) }}
            />
            <span className="text-sm text-white/75">{point.careerStage}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-white/10 px-4 py-3">
        {discussionPostId && onOpenDiscussion && (
          <button
            type="button"
            onClick={() => onOpenDiscussion(discussionPostId)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#38BDF8]/35 bg-[#38BDF8]/10 py-2.5 text-sm font-medium text-[#7DD3FC] transition-colors hover:bg-[#38BDF8]/20"
          >
            Open discussion thread
          </button>
        )}
        <button
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-white/45 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </button>
      </div>
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
