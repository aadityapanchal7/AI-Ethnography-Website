import Link from "next/link";
import { TiMicrophoneOutline } from "react-icons/ti";
import { FaGlobeAmericas } from "react-icons/fa";
import { Ubuntu } from 'next/font/google';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  variable: '--font-ubuntu',
  weight: "300"
});

export default function Home() {

  return (
    <div className={`min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 ${ubuntu.className}`}>
      {/* Hero Section */}
      <main className="pt-24">
        <section className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm lg:text-base mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now collecting global experiences
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white lg:leading-snug sm:leading-tight mb-6">
              Voices of{" "}
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI in Medicine
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto">
              A global ethnographic study capturing how healthcare professionals
              experience artificial intelligence in their daily practice. Share your story. Discover others.
            </p>

            {/* TODO: Replaces SVG with react-icons maybe */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/share"
                className="inline-flex items-center justify-center gap-2 sm:px-8 sm:py-4 px-6 py-3 rounded-2xl font-semibold text-lg lg:text-xl bg-linear-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
              >
                <TiMicrophoneOutline className="w-6 h-6" />
                <span>Share Your Experience</span>
              </Link>

              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 sm:px-8 sm:py-4 px-6 py-3 rounded-2xl font-semibold text-lg lg:text-xl border-2 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <FaGlobeAmericas className="w-4 h-4" />
                <span>Explore Global Stories</span>
              </Link>
            </div>

          </div>
        </section>

        {/* TODO Could maybe do something where the Stats update in real time along with metrics after AWS set up keeping hidden for now  */}
        {/* Stats Section */}
        <section className="border-y hidden border-slate-800/50 bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '50+', label: 'Countries' },
                { value: '8', label: 'Languages' },
                { value: '25+', label: 'Specialties' },
                { value: '100+', label: 'Experiences' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 hidden">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Two Ways to Participate</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Whether you want to contribute your own perspective or learn from colleagues worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Share Card */}
            <Link
              href="/share"
              className="group p-8 rounded-3xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Share Your Story</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Record a 5-minute audio reflection about your experience with AI in clinical practice.
                Your voice matters in shaping the future of healthcare.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Quick 5-minute audio recording
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completely anonymous
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Record in your preferred language
                </li>
              </ul>
              <div className="mt-6 flex items-center text-blue-400 font-medium group-hover:text-blue-300">
                Start recording
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Explore Card */}
            <Link
              href="/explore"
              className="group p-8 rounded-3xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Explore the Globe</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Discover experiences from healthcare professionals around the world.
                Filter by specialty, region, or emerging themes.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Interactive 3D globe visualization
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Search and filter highlights
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Explore emerging themes
                </li>
              </ul>
              <div className="mt-6 flex items-center text-emerald-400 font-medium group-hover:text-emerald-300">
                Start exploring
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 sm:py-1 py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-slate-500 sm:text-sm lg:text-base text-xs hidden">
              A research initiative exploring healthcare professionals&apos; experiences with AI.
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Affiliated with MIT Critical Data • Data stored securely • Contributions are anonymous
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
