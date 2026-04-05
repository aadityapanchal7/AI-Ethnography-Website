import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Voices of AI · MIT Critical Data",
  description: "A global ethnographic study documenting how healthcare professionals experience artificial intelligence in medicine.",
  keywords: ["AI", "medicine", "healthcare", "ethnography", "research", "MIT", "Critical Data"],
  authors: [{ name: "MIT Critical Data" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Voices of AI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
