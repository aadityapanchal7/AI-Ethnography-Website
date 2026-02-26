import Link from "next/link";
import { TiMicrophoneOutline } from "react-icons/ti";
import { FaLightbulb, FaDatabase } from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineGlobe, HiOutlineChatAlt2, HiOutlineUserGroup } from "react-icons/hi";
import { Ubuntu } from 'next/font/google';
import BackgroundGlobe from '@/components/BackgroundGlobe';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  variable: '--font-ubuntu',
  weight: ["300", "400", "500", "700"]
});

export default function Home() {
  return (
    <>
      {/* Background Globe - behind all content */}
      <BackgroundGlobe />

      {/* Main content */}
      <div className={`min-h-screen ${ubuntu.className} relative z-10`}>
        <main>

          {/* ── HERO ─────────────────────────────────────────── */}
          <section className="min-h-screen flex items-center justify-center px-6 pt-36 pb-12 relative overflow-hidden bg-black/60 backdrop-blur-md">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-sky-400/10 to-cyan-400/10 blur-3xl -z-10" />
            <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-sky-300/10 to-blue-400/10 blur-3xl -z-10" />

            <div className="max-w-6xl mx-auto w-full">
              {/* small eyebrow */}
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-6">
                MIT Critical Data · Digital Ethnography
              </p>

              {/* jumbo headline */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.08] mb-8 max-w-5xl">
                Voices of AI<br />in Medicine<span className="text-[#38BDF8]">.</span>
              </h1>

              {/* subheadline */}
              <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-12 max-w-2xl">
                A global, community-owned digital ethnography affiliated with documenting how healthcare learners and early-career professionals experience artificial intelligence in real time.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/share"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-sm bg-white text-black hover:bg-sky-100 transition-all shadow-lg"
                >
                  Share Your Story
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-sm border border-white/25 text-white hover:bg-white/10 transition-all"
                >
                  Explore Stories
                </Link>
              </div>

              {/* quick-nav pills — MIT Critical Data style */}
              <div className="mt-16 flex flex-col sm:flex-row gap-6 border-t border-white/10 pt-10">
                {[
                  { num: "01", label: "Research", href: "#research" },
                  { num: "02", label: "Methodology", href: "#methodology" },
                  { num: "03", label: "Participate", href: "#participate" },
                ].map(({ num, label, href }) => (
                  <a key={num} href={href} className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors">
                    <span className="text-xs font-mono text-[#38BDF8]">{num}</span>
                    <span className="text-sm font-medium">{label}</span>
                    <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── INTRO BAND ───────────────────────────────────── */}
          <section className="bg-black/70 backdrop-blur-md border-y border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <p className="text-2xl sm:text-3xl font-light text-white/80 leading-relaxed max-w-4xl">
                An archive that captures how AI is <span className="text-white font-medium">experienced, interpreted, and negotiated</span> within institutional and social contexts — before institutions stabilize meaning.
              </p>
            </div>
          </section>

          {/* ── MISSION: numbered pillars (MIT CD style) ─────── */}
          <section id="research" className="bg-black/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 py-14 lg:py-20">

              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-4">Our Mission</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-10 leading-tight max-w-3xl">
                An ecosystem for understanding AI in healthcare
              </h2>

              <div className="space-y-0 divide-y divide-white/10">
                {[
                  {
                    num: "1",
                    title: "We document lived experience",
                    body: "We collect 5-minute audio and video narratives in participants' native languages, capturing how AI is encountered in coursework, clinical settings, peer conversations, and personal experimentation.",
                    cta: { label: "Share a Story", href: "/share" },
                  },
                  {
                    num: "2",
                    title: "We build a global research archive",
                    body: "Contributions are collected continuously, allowing the project to evolve alongside changing technologies, policies, and social norms. The platform functions as a living document that also captures silences, hesitations, and omissions.",
                    cta: { label: "Explore the Archive", href: "/explore" },
                  },
                  {
                    num: "3",
                    title: "We center underrepresented voices",
                    body: "Geographic and cultural diversity is analytic material. We actively recruit from regions typically absent from global AI discourse, supporting participants in any language.",
                    cta: null,
                  },
                ].map(({ num, title, body, cta }) => (
                  <div key={num} className="py-14 grid lg:grid-cols-[80px_1fr_auto] gap-6 lg:gap-12 items-start group">
                    <span className="text-6xl lg:text-7xl font-bold text-white/10 group-hover:text-[#38BDF8]/20 transition-colors leading-none select-none">
                      {num}
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">{title}</h3>
                      <p className="text-white/55 leading-relaxed max-w-2xl">{body}</p>
                    </div>
                    {cta && (
                      <Link
                        href={cta.href}
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white hover:text-black transition-all mt-1"
                      >
                        {cta.label}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── METHODOLOGY ──────────────────────────────────── */}
          <section id="methodology" className="bg-black/70 backdrop-blur-md border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-14 lg:py-20">

              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-4">Confessionals & Testimonials</p>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
                    Personal narrative over academic abstraction
                  </h2>
                  <p className="text-white/55 leading-relaxed mb-8">
                    This approach is intentionally longitudinal and open-ended. Contributions are collected continuously, allowing the project to capture not only what is said about AI in medicine, but how conversations shift, intensify, or fall silent over time.
                  </p>
                  <p className="text-white/55 leading-relaxed">
                    A core innovation is the systematic treatment of non-speech as data. Silence, hesitation, humor, and indirect language are analyzed as meaningful responses to power and evaluative pressure.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <TiMicrophoneOutline className="w-5 h-5" />, title: "Audio & Video", desc: "5-min recordings in your native language" },
                    { icon: <HiOutlineUserGroup className="w-5 h-5" />, title: "Group Sessions", desc: "Classmates, friends, and family together" },
                    { icon: <HiOutlineChatAlt2 className="w-5 h-5" />, title: "Personal Stories", desc: "Lived experience, not academic theory" },
                    { icon: <FaDatabase className="w-5 h-5" />, title: "AI Analysis", desc: "Thematic analysis, human-interpreted" },
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#38BDF8]/40 transition-all">
                      <div className="text-[#38BDF8] mb-3">{item.icon}</div>
                      <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Questions */}
              <div className="mt-12 border-t border-white/10 pt-12">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-4">Key Research Questions</p>
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-12">
                  Understanding how attitudes toward AI are formed
                </h3>
                <div className="grid sm:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden">
                  {[
                    { q: "What experiences inform attitudes toward AI?", d: "Encounters with policies, peer guidance, AI tools in coursework, and personal experimentation" },
                    { q: "What themes emerge across cultures?", d: "How local educational structures, healthcare systems, and cultural norms shape conversations" },
                    { q: "What is not being discussed?", d: "Silences, self-censorship, fear of institutional reprisal, and 'algorithmic superstition'" },
                    { q: "Echo chambers vs. diverse perspectives?", d: "Comparing insular narratives with those that emerge through cross-cultural dialogue" },
                  ].map((item, i) => (
                    <div key={i} className="p-8 bg-black/60 hover:bg-white/[0.04] transition-colors">
                      <div className="text-xs font-mono text-[#38BDF8] mb-3">Q{String(i + 1).padStart(2, '0')}</div>
                      <h4 className="text-base font-semibold text-white mb-2 leading-snug">{item.q}</h4>
                      <p className="text-sm text-white/45 leading-relaxed">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── WHO CAN PARTICIPATE ───────────────────────────── */}
          <section id="participate" className="bg-black/50 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-14 lg:py-20">

              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-4">Participate</p>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-8">
                    Who can contribute
                  </h2>
                  <div className="space-y-5 text-white/55 leading-relaxed">
                    <p>
                      This project centers on those who encounter AI within environments shaped by <span className="text-white">learning, evaluation, and institutional power</span>. These individuals often experiment with AI tools early in practice, yet rarely influence how institutions govern those tools.
                    </p>
                    <p>
                      Participation extends beyond clinical training to include <span className="text-white">engineers, humanists, artists, and other collaborators</span> whose work intersects with medicine. Contributors may participate individually or in small groups.
                    </p>
                    <p>
                      Geographic and cultural diversity is <span className="text-white">analytic material</span>. Participants speak in their preferred languages while translation supports interpretation.
                    </p>
                  </div>
                  <Link
                    href="/share"
                    className="inline-flex items-center gap-2 mt-10 px-7 py-3.5 rounded-lg font-semibold text-sm bg-white text-black hover:bg-sky-100 transition-all"
                  >
                    Share Your Story
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/30 mb-6">Open to</p>
                  <div className="space-y-2">
                    {[
                      "Medical Students",
                      "Residents & Trainees",
                      "Early-Career Professionals",
                      "Computer Scientists",
                      "Public Health Researchers",
                      "Humanists & Artists",
                    ].map((label, i) => (
                      <div key={i} className="flex items-center gap-4 py-4 border-b border-white/10 group">
                        <span className="text-xs font-mono text-[#38BDF8] w-5">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-white/70 group-hover:text-white transition-colors font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── IMPACT ───────────────────────────────────────── */}
          <section className="bg-black/70 backdrop-blur-md border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-14 lg:py-20">

              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-4">Potential Impact</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-10 max-w-3xl">
                A time-sensitive record before institutions stabilize meaning
              </h2>

              <div className="grid lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden mb-12">
                {[
                  { label: "For Researchers", body: "A time-sensitive archive documenting how AI enters medical training before institutions stabilize meaning" },
                  { label: "For Educators", body: "Identify gaps between formal AI policies and lived practice to inform curriculum reform" },
                  { label: "For Policymakers", body: "Equity-oriented governance insights showing how attitudes vary by role, region, and institutional power" },
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-black/60 hover:bg-white/[0.04] transition-colors">
                    <div className="text-xs font-mono text-[#38BDF8] mb-4">{String(i + 1).padStart(2, '0')}</div>
                    <h3 className="text-lg font-semibold text-white mb-3">{item.label}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/[0.04]">
                <p className="text-white/70 leading-relaxed text-sm lg:text-base">
                  <span className="text-white font-semibold">Clear guardrails</span> prohibit use of the archive for surveillance, performance evaluation, or predictive profiling. Participants retain the right to withdraw contributions or reduce their visibility as circumstances change.
                </p>
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ────────────────────────────────────── */}
          <section className="bg-black/50 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-14 lg:py-20 text-center">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Add Your Voice<span className="text-[#38BDF8]">.</span>
              </h2>
              <p className="text-lg text-white/55 max-w-2xl mx-auto mb-12 leading-relaxed">
                Share a 5-minute audio or video recording describing your personal moments, tensions, and reflections related to AI in your educational, clinical, or creative life.
              </p>
              <Link
                href="/share"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-base bg-white text-black hover:bg-sky-100 transition-all shadow-lg"
              >
                Get Involved
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </section>

          {/* ── FOOTER ───────────────────────────────────────── */}
          <footer className="border-t border-white/10 py-12 bg-black relative z-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
              <p>© {new Date().getFullYear()} MIT Critical Data</p>
              <div className="flex gap-8">
                <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                <Link href="/share" className="hover:text-white transition-colors">Share</Link>
                <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
              </div>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}
