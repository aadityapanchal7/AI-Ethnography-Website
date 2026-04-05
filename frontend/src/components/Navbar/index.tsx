"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/discussion", label: "Discussion" },
  { href: "/share", label: "Share" },
  { href: "/explore", label: "Explore" },
  { href: "/contact", label: "Contact" },
] as const;

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

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
            <nav className="hidden items-center gap-4 sm:flex" aria-label="Main">
              <Link
                href="/map"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Map
              </Link>
              <Link
                href="/discussion"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Discussion
              </Link>
              <Link
                href="/share"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Share
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className="hidden rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition-all hover:bg-slate-100 sm:inline-flex"
              >
                Contact
              </Link>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/10 sm:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] sm:hidden"
          id="mobile-nav-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="absolute right-4 top-[calc(4rem+1rem)] max-h-[min(70vh,calc(100dvh-6rem))] w-[min(100%,280px)] overflow-y-auto rounded-2xl border border-white/15 bg-black/90 p-4 shadow-xl backdrop-blur-md"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
