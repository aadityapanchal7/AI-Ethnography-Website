import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discussion | MIT Critical Data',
  description: 'Read, search, and respond to AI-in-medicine discussion threads from the global archive.',
};

export default function DiscussionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
