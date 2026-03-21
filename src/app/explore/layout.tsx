import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Stories | MIT Critical Data",
  description: "Explore a global archive of narratives about AI in healthcare education and practice.",
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
