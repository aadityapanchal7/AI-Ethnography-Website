"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  {/* TODO: figure out better design for navbar content -- specifically how to display share/explore pages */ }
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <header
        className={`max-w-7xl mx-auto backdrop-blur-md bg-slate-900/40 bg-gradient-to-br from-slate-900/40 to-slate-900/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.05)] border border-white/10 transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Voices of AI</span>
            </Link>
            <nav className="items-center gap-4 hidden sm:flex">
              <Link
                href="/explore"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                Explore
              </Link>
              <Link
                href="/share"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                Share
              </Link>
            </nav>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 transition-all font-medium text-sm"
            >
              Contact
            </Link>

          </div>
        </div>
      </header>
    </div>
  );
}
