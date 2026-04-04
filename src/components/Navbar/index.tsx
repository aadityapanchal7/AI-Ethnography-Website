"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", controlNavbar, { passive: true });
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, []);

  {/* TODO: refine navbar content and ordering */}
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <header
        className={`max-w-7xl mx-auto backdrop-blur-md bg-black/40 bg-gradient-to-br from-black/900 to-black/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.05)] border border-white/20 transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/mit-logo.png"
                alt="MIT Logo"
                width={168}
                height={104}
                className="object-contain brightness-0 invert"
                style={{ width: "48px", height: "auto" }}
              />
              <div className="flex flex-col leading-none">
                <span className="text-xs font-semibold text-white tracking-widest uppercase">Critical</span>
                <span className="text-xs font-semibold text-white tracking-widest uppercase">Data</span>
              </div>
            </Link>
            <nav className="items-center gap-4 hidden sm:flex">
              <Link
                href="/map"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                Map
              </Link>
              <Link
                href="/discussion"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                Discussion
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
