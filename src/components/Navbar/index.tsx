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
        className={`max-w-7xl mx-auto backdrop-blur-md bg-slate-1000/95 rounded-3xl shadow-lg border-2 border-slate-200/50 transition-all duration-300 hover:scale-[1.01] hover:translate-y-0.5 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white-800">#LOGO</span>
            </Link>
            <nav className="items-center gap-6 hidden sm:flex">
              <Link
                href="/explore"
                className="text-white border-2 border-white/10 px-5 py-2.5 rounded-xl transition-colors font-medium"
              >
                Explore
              </Link>
              <Link
                href="/share"
                className="px-5 py-2.5 rounded-xl font-medium border-2 border-white/10 text-white transition-all"
              >
                Share
              </Link>
            </nav>
            <Link
              href="/contact"
              className="relative inline-block rounded-full p-[2px] bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:bg-linear-to-l transition-all duration-500"
            >
              <span className="block rounded-full border border-white/10 bg-slate-900 px-5 py-2.5 text-white font-medium">
                Contact
              </span>
            </Link>

          </div>
        </div>
      </header>
    </div>
  );
}
