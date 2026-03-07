'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { MapDataPoint } from '@/lib/types';

interface GlobeProps {
  data: MapDataPoint[];
  onPointClick: (point: MapDataPoint) => void;
  selectedPointId?: string | null;
}

export interface GlobeHandle {
  flyTo: (lat: number, lng: number) => void;
}

const Globe = forwardRef<GlobeHandle, GlobeProps>(function Globe(
  { data, onPointClick, selectedPointId },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<Record<string, unknown>>(null);
  const [GlobeGL, setGlobeGL] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  // Expose flyTo to parent via ref
  useImperativeHandle(ref, () => ({
    flyTo(lat: number, lng: number) {
      if (globeRef.current && typeof globeRef.current.pointOfView === 'function') {
        globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
      }
    },
  }));

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

  // Pulse the selected marker — only runs when a marker is selected
  useEffect(() => {
    if (!selectedPointId) {
      setPulse(false);
      return;
    }
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 600);
    return () => clearInterval(interval);
  }, [selectedPointId]);

  const handlePointClick = useCallback(
    (point: object) => {
      const typedPoint = point as MapDataPoint;
      onPointClick(typedPoint);
    },
    [onPointClick]
  );

  // Neon green by default, neon pink + pulsing when selected
  const pointsData = data.map((point) => {
    const isSelected = selectedPointId === point.id;
    return {
      ...point,
      lat: point.coordinates.lat,
      lng: point.coordinates.lng,
      size: isSelected ? (pulse ? 1.8 : 1.2) : 0.8,
      color: isSelected ? '#ff2d78' : '#39ff14',
    };
  });

  // HTML elements for country name labels
  const htmlData = data.map((point) => ({
    ...point,
    lat: point.coordinates.lat,
    lng: point.coordinates.lng,
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
                  ? 'bg-pink-500/20 border-2 border-pink-500'
                  : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedPointId === point.id ? '#ff2d78' : '#39ff14' }}
                />
                <span className="text-white text-sm font-medium">
                  {getCountryName(point.country)}
                </span>
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
        ref={globeRef}
        width={dimensions.width || 400}
        height={dimensions.height || 400}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        // ── Dot markers ──────────────────────────────────────────────
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.02}
        pointRadius="size"
        pointColor="color"

        // ── Country name labels ───────────────────────────────────────
        htmlElementsData={htmlData}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.12}
        htmlElement={(d: object) => {
          const point = d as MapDataPoint;
          const isSelected = selectedPointId === point.id;
          const color = isSelected ? '#ff2d78' : '#39ff14';
          const el = document.createElement('div');
          el.innerText = getCountryName(point.country);
          el.style.color = color;
          el.style.fontSize = '11px';
          el.style.fontWeight = '600';
          el.style.fontFamily = 'system-ui, sans-serif';
          el.style.background = 'rgba(10, 15, 30, 0.75)';
          el.style.padding = '2px 6px';
          el.style.borderRadius = '4px';
          el.style.whiteSpace = 'nowrap';
          el.style.pointerEvents = 'none';
          el.style.userSelect = 'none';
          el.style.transform = 'translate(-50%, -50%)';
          el.style.border = `1px solid ${color}40`;
          el.style.cursor = 'default';
          return el;
        }}

        // ── Hover tooltip ────────────────────────────────────────────
        pointLabel={(d: object) => {
          const point = d as MapDataPoint;
          const isSelected = selectedPointId === point.id;
          const color = isSelected ? '#ff2d78' : '#39ff14';
          return `
            <div style="background: rgba(15, 23, 42, 0.95); padding: 12px; border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.5); max-width: 250px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
                <span style="color: white; font-weight: 600;">${getCountryName(point.country)}</span>
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
        <h4 className="text-xs text-slate-400 uppercase tracking-wide mb-2">Markers</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />
            <span className="text-slate-300 text-xs">Story marker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff2d78', boxShadow: '0 0 6px #ff2d78' }} />
            <span className="text-slate-300 text-xs">Selected story</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Globe;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCountryName(code: string): string {
  const names: Record<string, string> = {
    AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AR: 'Argentina',
    AU: 'Australia', AT: 'Austria', BE: 'Belgium', BR: 'Brazil',
    CA: 'Canada', CL: 'Chile', CN: 'China', CO: 'Colombia',
    HR: 'Croatia', CZ: 'Czech Republic', DK: 'Denmark', EG: 'Egypt',
    ET: 'Ethiopia', FI: 'Finland', FR: 'France', DE: 'Germany',
    GH: 'Ghana', GR: 'Greece', HU: 'Hungary', IN: 'India',
    ID: 'Indonesia', IE: 'Ireland', IL: 'Israel', IT: 'Italy',
    JP: 'Japan', JO: 'Jordan', KE: 'Kenya', KR: 'South Korea',
    MX: 'Mexico', MA: 'Morocco', NL: 'Netherlands', NZ: 'New Zealand',
    NG: 'Nigeria', NO: 'Norway', PK: 'Pakistan', PE: 'Peru',
    PH: 'Philippines', PL: 'Poland', PT: 'Portugal', RO: 'Romania',
    RU: 'Russia', SA: 'Saudi Arabia', SN: 'Senegal', ZA: 'South Africa',
    ES: 'Spain', SE: 'Sweden', CH: 'Switzerland', TZ: 'Tanzania',
    TH: 'Thailand', TR: 'Turkey', UG: 'Uganda', UA: 'Ukraine',
    GB: 'United Kingdom', US: 'United States', UY: 'Uruguay',
    VN: 'Vietnam', ZW: 'Zimbabwe',
  };
  return names[code.toUpperCase()] ?? code;
}
