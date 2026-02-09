import Link from "next/link";
import { TiMicrophoneOutline } from "react-icons/ti";
import { FaGlobeAmericas, FaUsers, FaLightbulb, FaDatabase, FaQuoteLeft } from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineGlobe, HiOutlineChatAlt2, HiOutlineUserGroup } from "react-icons/hi";
import { Ubuntu } from 'next/font/google';

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
    <div className={`min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 ${ubuntu.className}`}>
      {/* Hero Section */}
      <main>
        <section className="min-h-[100dvh] flex items-center justify-center px-4 pt-20 pb-12">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm lg:text-base mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now collecting global experiences
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white lg:leading-tight sm:leading-tight mb-6">
              Voices of{" "}
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI in Medicine
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 leading-relaxed mb-12 max-w-3xl mx-auto">
              A global, community-owned digital ethnography documenting how healthcare learners and early-career professionals experience artificial intelligence in real time.
            </p>

            {/* CTA Buttons */}
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

        {/* About Section */}
        <section className="border-y border-slate-800/50 bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Why This Project?
                </h2>
                <div className="space-y-4 text-slate-400 text-lg leading-relaxed">
                  <p>
                    Artificial intelligence is rapidly reshaping healthcare and medical education—from automated documentation and diagnostic support to generative tools used for studying and reflection. Yet how AI is <span className="text-white">experienced, interpreted, and negotiated</span> within institutional and social contexts remains only partially understood.
                  </p>
                  <p>
                    Existing scholarship has largely relied on cross-sectional surveys and policy analyses, capturing attitudes as <span className="text-white">static and decontextualized</span>. These methods overlook how beliefs about AI are shaped through informal conversations, institutional norms, and lived encounters over time.
                  </p>
                  <p>
                    Moreover, current literature reflects perspectives from a <span className="text-white">limited set of geographic and cultural contexts</span>. This project aims to center voices typically absent from global discourse.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <div className="relative p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50">
                  <FaQuoteLeft className="w-10 h-10 text-blue-400/30 mb-4" />
                  <p className="text-xl lg:text-2xl text-white leading-relaxed italic">
                    &ldquo;By prioritizing narrative expression in participants&apos; own languages, we center lived experience as the primary source of insight into how meaning around AI is formed and contested.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Project Vision
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Creating infrastructure for collective reflection across cultures and disciplines
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <HiOutlineGlobe className="w-8 h-8" />, title: "Community-Owned", desc: "Ongoing oversight platform for AI's impact" },
              { icon: <HiOutlineChatAlt2 className="w-8 h-8" />, title: "Authentic Stories", desc: "Moving beyond academic discourse" },
              { icon: <HiOutlineDocumentText className="w-8 h-8" />, title: "Rich Resource", desc: "For sociological & anthropological research" },
              { icon: <FaLightbulb className="w-8 h-8" />, title: "Critical Thinking", desc: "Through cross-cultural dialogue" }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology Section */}
        <section className="border-y border-slate-800/50 bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Confessionals & Testimonials
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Our methodology centers personal narrative over academic abstraction
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {methodologyFeatures.map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 lg:p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <p className="text-slate-300 text-center lg:text-lg">
                This approach is <span className="text-white font-medium">intentionally longitudinal and open-ended</span>. Contributions are collected continuously, allowing the project to evolve alongside changing technologies, policies, and social norms. The platform functions as a <span className="text-white font-medium">living document</span> that captures not only what is said about AI in medicine, but also how conversations shift, intensify, or fall silent over time.
              </p>
            </div>
          </div>
        </section>

        {/* Research Questions Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Key Research Questions
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Understanding how attitudes toward AI are formed, negotiated, and expressed
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {researchQuestions.map((item, i) => (
              <div key={i} className="p-6 lg:p-8 rounded-2xl bg-linear-to-br from-blue-500/5 to-purple-500/5 border border-slate-700/50 hover:border-blue-500/30 transition-all">
                <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">{item.question}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Participants Section */}
        <section className="border-y border-slate-800/50 bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Medical Students", color: "from-blue-500 to-cyan-500" },
                    { label: "Trainees", color: "from-purple-500 to-pink-500" },
                    { label: "Early-Career Professionals", color: "from-emerald-500 to-teal-500" },
                    { label: "Computer Scientists", color: "from-orange-500 to-amber-500" },
                    { label: "Public Health", color: "from-rose-500 to-red-500" },
                    { label: "Humanists & Artists", color: "from-indigo-500 to-violet-500" }
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-xl bg-linear-to-br ${item.color} bg-opacity-10 border border-white/10`}>
                      <span className="text-white font-medium text-sm lg:text-base">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Who Can Participate?
                </h2>
                <div className="space-y-4 text-slate-400 text-lg leading-relaxed">
                  <p>
                    This project centers on those who encounter AI within environments shaped by <span className="text-white">learning, evaluation, and institutional power</span>. These individuals often experiment with AI tools early in practice, yet rarely influence how institutions govern those tools.
                  </p>
                  <p>
                    Participation extends beyond clinical training to include <span className="text-white">engineers, humanists, artists, and other collaborators</span> whose work intersects with medicine. Contributors may participate individually or in small groups.
                  </p>
                  <p>
                    Geographic and cultural diversity functions as <span className="text-white">analytic material</span>. Participants speak in their preferred languages while translation supports interpretation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Novel Contributions Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              What Makes This Different?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A methodological alternative that foregrounds voice, context, and temporality
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {novelContributions.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-300 lg:text-lg">{item}</span>
                </div>
              ))}
            </div>
            <div className="p-8 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-4">Treating Non-Speech as Data</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                A core innovation is the systematic treatment of non-speech as data. Silence, hesitation, humor, indirect language, and omission are analyzed as <span className="text-white">meaningful responses to power, surveillance, and evaluative pressure</span> rather than gaps or missing information.
              </p>
              <p className="text-slate-400 leading-relaxed">
                By tracking interactional cues—who speaks first, who defers, how uncertainty is expressed—the project makes visible forms of self-censorship, algorithmic mystification, and moral outsourcing that conventional studies rarely capture.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="border-y border-slate-800/50 bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Potential Impact
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Creating a time-sensitive record before institutions stabilize meaning
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {impactAreas.map((area, i) => (
                <div key={i} className="p-6 lg:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-3">{area.title}</h3>
                  <p className="text-slate-400">{area.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 lg:p-8 rounded-2xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <p className="text-slate-300 text-center lg:text-lg">
                <span className="text-amber-400 font-medium">Clear guardrails</span> prohibit use of the archive for surveillance, performance evaluation, or predictive profiling. Participants retain the right to withdraw contributions or reduce their visibility as circumstances change.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Add Your Voice
            </h2>
            <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10">
              Share a 5-minute audio or video recording describing your personal moments, tensions, and reflections related to AI in your educational, clinical, or creative life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/share"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg lg:text-xl bg-linear-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
              >
                <TiMicrophoneOutline className="w-6 h-6" />
                <span>Share Your Experience</span>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg lg:text-xl border-2 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <FaGlobeAmericas className="w-4 h-4" />
                <span>Explore Global Stories</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-slate-600 text-sm">
              Affiliated with MIT Critical Data • Data stored securely • Contributions are anonymous
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
