'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import HighlightsFeed from '@/components/HighlightsFeed';
import ThemesPanel from '@/components/ThemesPanel';
import type { Testimonial, Theme, MapDataPoint } from '@/lib/types';
import { getHighlights, getMapData, getThemes } from '@/lib/api';
import { countries, languages, specialties } from '@/lib/mockData';

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
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [highlights, setHighlights] = useState<Testimonial[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<MapDataPoint | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('highlights');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch data on mount
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

  // Filter data when theme is selected
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

  const handlePointClick = useCallback((point: MapDataPoint) => {
    setSelectedPoint(point);
    setIsSidebarOpen(true);
  }, []);

  const handleHighlightClick = useCallback((testimonial: Testimonial) => {
    // Find corresponding map point
    const point = mapData.find((p) => p.id === testimonial.id);
    if (point) {
      setSelectedPoint(point);
    }
  }, [mapData]);

  const handleThemeClick = useCallback((theme: Theme) => {
    if (theme.id === selectedThemeId || !theme.id) {
      setSelectedThemeId(null);
    } else {
      setSelectedThemeId(theme.id);
    }
  }, [selectedThemeId]);

  // Get display names
  const getCountryName = (code: string) =>
    countries.find((c) => c.code === code)?.name || code;
  const getLanguageName = (code: string) =>
    languages.find((l) => l.code === code)?.name || code;
  const getSpecialtyName = (value: string) =>
    specialties.find((s) => s.value === value)?.label || value;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Globe Section */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <Globe
            data={mapData}
            onPointClick={handlePointClick}
            selectedPointId={selectedPoint?.id}
          />

          {/* Selected Point Detail Overlay */}
          {selectedPoint && (
            <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:max-w-md bg-slate-900/95 backdrop-blur rounded-2xl border border-slate-700/50 p-4 shadow-2xl">
              <button
                onClick={() => setSelectedPoint(null)}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{getCountryFlag(selectedPoint.country)}</span>
                <span className="font-semibold text-white">{getCountryName(selectedPoint.country)}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300">
                  {selectedPoint.careerStage}
                </span>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed mb-4">
                &ldquo;{selectedPoint.highlight}&rdquo;
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs">
                  {getSpecialtyName(selectedPoint.metadata.specialty)}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs">
                  {getLanguageName(selectedPoint.metadata.language)}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs">
                  {selectedPoint.metadata.practiceSetting}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside
          className={`w-full lg:w-96 bg-slate-900/95 backdrop-blur border-t lg:border-t-0 lg:border-l border-slate-800/50 flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
          } fixed lg:relative bottom-0 left-0 right-0 h-[70vh] lg:h-auto z-40 lg:z-0 rounded-t-2xl lg:rounded-none`}
        >
          {/* Mobile Handle */}
          <div className="lg:hidden flex justify-center py-2 border-b border-slate-800/50">
            <div className="w-12 h-1 rounded-full bg-slate-700" />
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-800/50">
            <button
              onClick={() => setActiveTab('highlights')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'highlights'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Highlights
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'themes'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Themes
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'highlights' ? (
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Simple flag emoji helper
function getCountryFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
