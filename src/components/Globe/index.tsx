'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { MapDataPoint } from '@/lib/types';

interface GlobeProps {
  data: MapDataPoint[];
  onPointClick: (point: MapDataPoint) => void;
  selectedPointId?: string | null;
}

// Dynamic import for react-globe.gl since it requires window
export default function Globe({ data, onPointClick, selectedPointId }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [GlobeGL, setGlobeGL] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically import react-globe.gl
  useEffect(() => {
    import('react-globe.gl').then((mod) => {
      setGlobeGL(() => mod.default);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handlePointClick = useCallback(
    (point: object) => {
      const typedPoint = point as MapDataPoint;
      onPointClick(typedPoint);
    },
    [onPointClick]
  );

  // Convert data to globe format
  const pointsData = data.map((point) => ({
    ...point,
    lat: point.coordinates.lat,
    lng: point.coordinates.lng,
    size: selectedPointId === point.id ? 0.8 : 0.4,
    color: selectedPointId === point.id ? '#f472b6' : getCareerStageColor(point.careerStage),
  }));

  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400">Loading globe...</p>
        </div>
      </div>
    );
  }

  if (!GlobeGL) {
    // Fallback to simple map view if globe fails to load
    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-slate-900/50 rounded-2xl p-4"
      >
        <div className="text-center mb-4">
          <h3 className="text-white font-medium">Experience Locations</h3>
          <p className="text-slate-400 text-sm">Click on a location to view details</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
          {data.map((point) => (
            <button
              key={point.id}
              onClick={() => onPointClick(point)}
              className={`p-3 rounded-xl text-left transition-all ${
                selectedPointId === point.id
                  ? 'bg-blue-500/20 border-2 border-blue-500'
                  : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCareerStageColor(point.careerStage) }}
                />
                <span className="text-white text-sm font-medium">{point.country}</span>
              </div>
              <p className="text-slate-400 text-xs truncate">{point.highlight}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <GlobeGL
        width={dimensions.width || 400}
        height={dimensions.height || 400}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.01}
        pointRadius="size"
        pointColor="color"
        pointLabel={(d: object) => {
          const point = d as MapDataPoint;
          return `
            <div style="background: rgba(15, 23, 42, 0.95); padding: 12px; border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.5); max-width: 250px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${getCareerStageColor(point.careerStage)}"></span>
                <span style="color: white; font-weight: 600;">${point.country}</span>
                <span style="color: #94a3b8; font-size: 12px;">${point.careerStage}</span>
              </div>
              <p style="color: #cbd5e1; font-size: 13px; line-height: 1.4;">"${point.highlight}"</p>
            </div>
          `;
        }}
        onPointClick={handlePointClick}
        enablePointerInteraction={true}
        animateIn={true}
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.25}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur rounded-xl p-3 border border-slate-700/50">
        <h4 className="text-xs text-slate-400 uppercase tracking-wide mb-2">Career Stage</h4>
        <div className="space-y-1">
          {(['Trainee', 'Early-career', 'Mid-career', 'Senior'] as const).map((stage) => (
            <div key={stage} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCareerStageColor(stage) }}
              />
              <span className="text-slate-300 text-xs">{stage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getCareerStageColor(stage: string): string {
  switch (stage) {
    case 'Trainee':
      return '#22d3ee'; // cyan
    case 'Early-career':
      return '#34d399'; // emerald
    case 'Mid-career':
      return '#fbbf24'; // amber
    case 'Senior':
      return '#a78bfa'; // violet
    default:
      return '#64748b'; // slate
  }
}

