import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Map | MIT Critical Data',
  description: 'Explore a global archive of narratives about AI in healthcare education and practice on the map.',
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
