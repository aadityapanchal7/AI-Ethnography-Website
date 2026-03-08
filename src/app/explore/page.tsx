'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import HighlightsFeed from '@/components/HighlightsFeed';
import ThemesPanel from '@/components/ThemesPanel';
import type { Testimonial, Theme, MapDataPoint } from '@/lib/types';
import { getHighlights, getMapData, getThemes } from '@/lib/api';
import { countries, languages, specialties } from '@/lib/mockData';
import type { GlobeHandle } from '@/components/Globe';

// Dynamically import Globe to avoid SSR issues
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

export default function ExplorePage() {
  const globeRef = useRef<GlobeHandle>(null);
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
        const [mapDataResult, highlightsResult, themesResult] = await Promise.all([
          getMapData(),
          getHighlights(),
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
  }, []);

  useEffect(() => {
    async function filterData() {
      if (selectedThemeId) {
        const [filteredMap, filteredHighlights] = await Promise.all([
          getMapData({ themeId: selectedThemeId }),
          getHighlights({ themeId: selectedThemeId }),
        ]);
        setMapData(filteredMap);
        setHighlights(filteredHighlights);
      } else {
        const [allMap, allHighlights] = await Promise.all([
          getMapData(),
          getHighlights(),
        ]);
        setMapData(allMap);
        setHighlights(allHighlights);
      }
    }
    filterData();
  }, [selectedThemeId]);

  // Clicking a globe marker → show detail + open sidebar
  const handlePointClick = useCallback((point: MapDataPoint) => {
    setSelectedPoint(point);
    setIsSidebarOpen(true);
  }, []);

  // Clicking a sidebar story → fly globe camera to that marker + show detail
  const handleHighlightClick = useCallback((testimonial: Testimonial) => {
    const point = mapData.find((p) => p.id === testimonial.id);
    if (point) {
      setSelectedPoint(point);
      setIsSidebarOpen(true);
      globeRef.current?.flyTo(
        point.coordinates.lat,
        point.coordinates.lng
      );
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

  const getCountryName = (code: string) =>
    countries.find((c) => c.code === code)?.name || code;
  const getLanguageName = (code: string) =>
    languages.find((l) => l.code === code)?.name || code;
  const getSpecialtyName = (value: string) =>
    specialties.find((s) => s.value === value)?.label || value;

  return (
    <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* Globe Section */}
        <div className="flex-1 relative min-h-0">
          <Globe
            ref={globeRef}
            data={mapData}
            onPointClick={handlePointClick}
            selectedPointId={selectedPoint?.id}
          />
        </div>

        {/* Sidebar */}
        <aside
          className={`w-full lg:w-96 flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
          } fixed lg:relative bottom-0 left-0 right-0 h-[70vh] lg:h-auto z-40 lg:z-0 rounded-t-2xl lg:rounded-none`}
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #0c1427 100%)',
            borderLeft: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5), inset 1px 0 0 rgba(99, 102, 241, 0.1)',
          }}
        >
          {/* Mobile Handle */}
          <div className="lg:hidden flex justify-center py-2 border-b border-slate-800/50">
            <div className="w-12 h-1 rounded-full bg-slate-600" />
          </div>

          {/* Sidebar Header */}
          <div
            className="px-4 py-3 border-b border-slate-800/60"
            style={{ background: 'rgba(15, 23, 42, 0.8)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm tracking-wide">
                {selectedPoint ? 'Story Detail' : 'Explore Stories'}
              </h2>
              {!isLoading && !selectedPoint && (
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  {highlights.length} voices
                </span>
              )}
            </div>

            {/* Tab Switcher — hidden when a point is selected */}
            {!selectedPoint && (
              <div className="flex gap-1 bg-slate-800/60 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('highlights')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'highlights'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Highlights
                </button>
                <button
                  onClick={() => setActiveTab('themes')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'themes'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Themes
                </button>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {selectedPoint ? (
              <PointDetailPanel
                point={selectedPoint}
                onClose={handleCloseDetail}
                getCountryName={getCountryName}
                getLanguageName={getLanguageName}
                getSpecialtyName={getSpecialtyName}
              />
            ) : activeTab === 'highlights' ? (
              <HighlightsFeed
                highlights={highlights}
                selectedId={selectedPoint?.id}
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

      {/* Sidebar Backdrop (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Point Detail Panel ───────────────────────────────────────────────────────

function PointDetailPanel({
  point,
  onClose,
  getCountryName,
  getLanguageName,
  getSpecialtyName,
}: {
  point: MapDataPoint;
  onClose: () => void;
  getCountryName: (code: string) => string;
  getLanguageName: (code: string) => string;
  getSpecialtyName: (value: string) => string;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
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
            <p className="text-slate-400 text-xs mt-0.5">{point.careerStage}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Back to feed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quote */}
        <div className="relative pl-4 border-l-2 border-blue-500 bg-slate-800/30 rounded-r-xl py-3 pr-3">
          <p className="text-slate-200 text-sm leading-relaxed italic">
            &ldquo;{point.highlight}&rdquo;
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Details</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
              {getSpecialtyName(point.metadata.specialty)}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
              {getLanguageName(point.metadata.language)}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
              {point.metadata.practiceSetting}
            </span>
          </div>
        </div>

        {/* Career Stage */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Career Stage</p>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getCareerStageColor(point.careerStage) }}
            />
            <span className="text-slate-300 text-sm">{point.careerStage}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800/50">
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCareerStageColor(stage: string): string {
  switch (stage) {
    case 'Trainee':      return '#22d3ee';
    case 'Early-career': return '#34d399';
    case 'Mid-career':   return '#fbbf24';
    case 'Senior':       return '#a78bfa';
    default:             return '#64748b';
  }
}
