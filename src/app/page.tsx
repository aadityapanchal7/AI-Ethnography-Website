import Link from "next/link";
import { TiMicrophoneOutline } from "react-icons/ti";
import { FaGlobeAmericas, FaUsers, FaLightbulb, FaDatabase, FaQuoteLeft } from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineGlobe, HiOutlineChatAlt2, HiOutlineUserGroup } from "react-icons/hi";
import { Ubuntu } from 'next/font/google';
import BackgroundGlobe from '@/components/BackgroundGlobe';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  variable: '--font-ubuntu',
  weight: ["300", "400", "500", "700"]
});

export default function Home() {

  const researchQuestions = [
    {
      question: "What experiences inform attitudes toward AI?",
      description: "Encounters with policies, peer guidance, AI tools in coursework, and personal experimentation"
    },
    {
      question: "What themes emerge across cultures?",
      description: "How local educational structures, healthcare systems, and cultural norms shape conversations"
    },
    {
      question: "What is not being discussed?",
      description: "Silences, self-censorship, fear of institutional reprisal, and 'algorithmic superstition'"
    },
    {
      question: "Echo chambers vs. diverse perspectives?",
      description: "Comparing insular narratives with those that emerge through cross-cultural dialogue"
    }
  ];

  const methodologyFeatures = [
    {
      icon: <TiMicrophoneOutline className="w-6 h-6" />,
      title: "Audio & Video Narratives",
      description: "5-minute recordings in your native language and colloquial expression"
    },
    {
      icon: <HiOutlineUserGroup className="w-6 h-6" />,
      title: "Group Recordings",
      description: "Encourage classmates, friends, and family to share together"
    },
    {
      icon: <HiOutlineChatAlt2 className="w-6 h-6" />,
      title: "Personal Stories",
      description: "Focus on lived experiences rather than academic perspectives"
    },
    {
      icon: <FaDatabase className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Continuous thematic analysis while preserving human interpretation"
    }
  ];

  const novelContributions = [
    "Real-time digital ethnography capturing AI adoption as it happens",
    "Systematic treatment of silence, hesitation, and omission as meaningful data",
    "Analysis of dialectical differences in expressing fear and enthusiasm",
    "Geographic and cultural comparative analysis across regions",
    "Alternative to traditional surveys and interviews"
  ];

  const impactAreas = [
    {
      title: "For Researchers",
      description: "A time-sensitive archive documenting how AI enters medical training before institutions stabilize meaning"
    },
    {
      title: "For Educators",
      description: "Identify gaps between formal AI policies and lived practice to inform curriculum reform"
    },
    {
      title: "For Policymakers",
      description: "Equity-oriented governance insights showing how attitudes vary by role, region, and institutional power"
    }
  ];

  return (
    <>
      {/* Background Globe - behind all content */}
      <BackgroundGlobe />

      {/* Main content with z-index to appear above globe */}
      <div className={`min-h-screen ${ubuntu.className} relative z-10`}>
        {/* Hero Section */}
        <main>
          <section className="min-h-[90vh] flex items-center justify-center px-4 pt-32 pb-20 relative overflow-hidden bg-slate-900/40 backdrop-blur-md">
            {/* Decorative spheres */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl -z-10" />
            <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl -z-10" />

            <div className="text-center max-w-5xl mx-auto relative z-10">
              {/* Headline */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white lg:leading-[1.1] sm:leading-tight mb-8">
                Voices of AI in Medicine<span className="text-[#3B82F6]">.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed mb-12 max-w-3xl mx-auto">
                A global, community-owned digital ethnography documenting how healthcare learners and early-career professionals experience artificial intelligence in real time.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/share"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-lg"
                >
                  <span>Share Story</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border-2 border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <span>Learn More</span>
                </Link>
              </div>

            </div>
          </section>

          {/* About Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 bg-slate-900/30 backdrop-blur-md rounded-3xl my-16 border-2 border-white/10 shadow-sm">
            <div className="max-w-4xl">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight">
                Why This Project<span className="text-[#3B82F6]">.</span>
              </h2>
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                <p>
                  Artificial intelligence is rapidly reshaping healthcare and medical education—from automated documentation and diagnostic support to generative tools used for studying and reflection. Yet how AI is <span className="text-white font-medium">experienced, interpreted, and negotiated</span> within institutional and social contexts remains only partially understood.
                </p>
                <p>
                  Existing scholarship has largely relied on cross-sectional surveys and policy analyses, capturing attitudes as <span className="text-white font-medium">static and decontextualized</span>. These methods overlook how beliefs about AI are shaped through informal conversations, institutional norms, and lived encounters over time.
                </p>
                <p>
                  Moreover, current literature reflects perspectives from a <span className="text-white font-medium">limited set of geographic and cultural contexts</span>. This project aims to center voices typically absent from global discourse.
                </p>
              </div>
            </div>
          </section>

          {/* Vision Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 bg-slate-900/20 backdrop-blur-sm rounded-3xl my-16 border-2 border-white/5 shadow-sm">
            <div className="mb-16">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Project Vision<span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl">
                Creating infrastructure for collective reflection across cultures and disciplines
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <HiOutlineGlobe className="w-6 h-6" />, title: "Community-Owned", desc: "Ongoing oversight platform for AI's impact" },
                { icon: <HiOutlineChatAlt2 className="w-6 h-6" />, title: "Authentic Stories", desc: "Moving beyond academic discourse" },
                { icon: <HiOutlineDocumentText className="w-6 h-6" />, title: "Rich Resource", desc: "For sociological & anthropological research" },
                { icon: <FaLightbulb className="w-6 h-6" />, title: "Critical Thinking", desc: "Through cross-cultural dialogue" }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border-2 border-white/10 hover:border-[#3B82F6]/50 transition-all group shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Methodology Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 bg-slate-900/30 backdrop-blur-md rounded-3xl my-16 border-2 border-white/10 shadow-sm">
            <div className="mb-16">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Confessionals & Testimonials<span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl">
                Our methodology centers personal narrative over academic abstraction
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {methodologyFeatures.map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border-2 border-white/10 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/20 backdrop-blur-sm border-2 border-[#3B82F6]/40">
              <p className="text-slate-300 text-center lg:text-lg leading-relaxed">
                This approach is <span className="text-white font-medium">intentionally longitudinal and open-ended</span>. Contributions are collected continuously, allowing the project to evolve alongside changing technologies, policies, and social norms. The platform functions as a <span className="text-white font-medium">living document</span> that captures not only what is said about AI in medicine, but also how conversations shift, intensify, or fall silent over time.
              </p>
            </div>
          </section>

          {/* Research Questions Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 bg-slate-900/20 backdrop-blur-sm rounded-3xl my-16 border-2 border-white/5 shadow-sm">
            <div className="mb-16">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Key Research Questions<span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl">
                Understanding how attitudes toward AI are formed, negotiated, and expressed
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {researchQuestions.map((item, i) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-800/40 backdrop-blur-sm border-2 border-white/10 hover:border-[#3B82F6]/50 transition-all shadow-sm hover:shadow-md">
                  <div className="text-xs font-mono text-[#3B82F6] mb-3">QUESTION [{String(i + 1).padStart(2, '0')}]</div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3 leading-tight">{item.question}</h3>
                  <p className="text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Participants Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 bg-slate-900/30 backdrop-blur-md rounded-3xl my-16 border-2 border-white/10 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                  Who Can Participate<span className="text-[#3B82F6]">.</span>
                </h2>
                <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                  <p>
                    This project centers on those who encounter AI within environments shaped by <span className="text-white font-medium">learning, evaluation, and institutional power</span>. These individuals often experiment with AI tools early in practice, yet rarely influence how institutions govern those tools.
                  </p>
                  <p>
                    Participation extends beyond clinical training to include <span className="text-white font-medium">engineers, humanists, artists, and other collaborators</span> whose work intersects with medicine. Contributors may participate individually or in small groups.
                  </p>
                  <p>
                    Geographic and cultural diversity functions as <span className="text-white font-medium">analytic material</span>. Participants speak in their preferred languages while translation supports interpretation.
                  </p>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Medical Students" },
                    { label: "Trainees" },
                    { label: "Early-Career Professionals" },
                    { label: "Computer Scientists" },
                    { label: "Public Health" },
                    { label: "Humanists & Artists" }
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-xl bg-slate-800/40 backdrop-blur-sm border-2 border-[#3B82F6]/40 shadow-sm hover:shadow-md transition-all text-center">
                      <span className="text-white font-medium text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Novel Contributions Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 bg-slate-900/20 backdrop-blur-sm rounded-3xl my-16 border-2 border-white/5 shadow-sm">
            <div className="mb-16">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                What Makes This Different<span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl">
                A methodological alternative that foregrounds voice, context, and temporality
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {novelContributions.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-slate-800/40 backdrop-blur-sm border-2 border-white/10 shadow-sm hover:shadow-md transition-all">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-8 rounded-2xl bg-slate-800/20 backdrop-blur-sm border-2 border-[#3B82F6]/40">
                <div className="text-xs font-mono text-[#3B82F6] mb-4">INNOVATION</div>
                <h3 className="text-xl lg:text-2xl font-semibold text-white mb-6">Treating Non-Speech as Data</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                  A core innovation is the systematic treatment of non-speech as data. Silence, hesitation, humor, indirect language, and omission are analyzed as <span className="text-white font-medium">meaningful responses to power, surveillance, and evaluative pressure</span> rather than gaps or missing information.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  By tracking interactional cues—who speaks first, who defers, how uncertainty is expressed—the project makes visible forms of self-censorship, algorithmic mystification, and moral outsourcing that conventional studies rarely capture.
                </p>
              </div>
            </div>
          </section>

          {/* Impact Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 bg-slate-900/30 backdrop-blur-md rounded-3xl my-16 border-2 border-white/10 shadow-sm">
            <div className="mb-16">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Potential Impact<span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl">
                Creating a time-sensitive record before institutions stabilize meaning
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              {impactAreas.map((area, i) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-800/40 backdrop-blur-sm border-2 border-white/10 shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-mono text-[#3B82F6] mb-4">IMPACT [{String(i + 1).padStart(2, '0')}]</div>
                  <h3 className="text-xl font-semibold text-white mb-4">{area.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{area.description}</p>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30">
              <p className="text-slate-300 text-center lg:text-lg leading-relaxed">
                <span className="text-white font-semibold">Clear guardrails</span> prohibit use of the archive for surveillance, performance evaluation, or predictive profiling. Participants retain the right to withdraw contributions or reduce their visibility as circumstances change.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-6xl mx-auto px-4 py-24 lg:py-32 relative overflow-hidden bg-slate-900/20 backdrop-blur-sm rounded-3xl my-16 border-2 border-white/5 shadow-sm">
            {/* Decorative sphere */}
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl -z-10" />

            <div className="text-center relative z-10">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Add Your Voice<span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-slate-300 text-lg lg:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                Share a 5-minute audio or video recording describing your personal moments, tensions, and reflections related to AI in your educational, clinical, or creative life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/share"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-lg"
                >
                  <span>Get in Touch</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 py-12 bg-slate-900/40 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-slate-400 text-sm">
                  Affiliated with MIT Critical Data
                </p>
                <div className="flex gap-6 text-sm text-slate-400">
                  <span>Insights</span>
                  <span>Contact</span>
                  <a href="mailto:hello@voicesofai.com" className="hover:text-white transition-colors">
                    hello@voicesofai.com
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
