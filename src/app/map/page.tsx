import { Suspense } from 'react';
import MapPageClient from './MapPageClient';

function MapPageFallback() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center bg-black pt-28 px-6">
      <div className="w-12 h-12 rounded-full border-2 border-[#38BDF8]/30 border-t-[#38BDF8] animate-spin mb-4" />
      <p className="text-sm text-white/60">Loading map…</p>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<MapPageFallback />}>
      <MapPageClient />
    </Suspense>
  );
}
