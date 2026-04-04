'use client';

import dynamic from 'next/dynamic';

const BackgroundGlobe = dynamic(() => import('@/components/BackgroundGlobe'), {
  ssr: false,
  loading: () => null,
});

export default function HomeBackgroundGlobe() {
  return <BackgroundGlobe />;
}
