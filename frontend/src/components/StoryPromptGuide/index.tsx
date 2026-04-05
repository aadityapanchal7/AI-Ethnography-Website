'use client';

const PROMPTS = [
  'Tell us about a recent moment when AI changed how you or someone you know experienced healthcare — what happened, and how did it make you feel?',
  'What is your group most hopeful about — and most worried about — when it comes to AI playing a bigger role in health and wellbeing in your community?',
  'Has AI changed the way your group talks to each other, trusts information, or makes decisions about health? Can you walk us through a specific example?',
  'Who in your community is being left out of the conversation about AI and health, and what do you think they would say if they were here?',
  'If you could send a message to the people designing AI tools for healthcare, what would you want them to understand about your daily reality?',
];

export default function StoryPromptGuide() {
  return (
    <div className="rounded-2xl border border-[#38BDF8]/25 bg-[#38BDF8]/[0.06] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#38BDF8]">
        Story prompts · pick what fits your group
      </p>
      <p className="mt-2 text-sm text-white/65 leading-relaxed">
        You don&apos;t need to answer every question — use them as sparks for a{' '}
        <span className="text-white/90">3–5 minute</span> voice conversation (max{' '}
        <span className="text-white/90">5 minutes</span> per upload). Audio only, no typed stories.
      </p>
      <ol className="mt-4 space-y-3 text-sm text-white/80 list-decimal list-inside marker:text-[#38BDF8]">
        {PROMPTS.map((text, i) => (
          <li key={i} className="leading-relaxed pl-1">
            {text}
          </li>
        ))}
      </ol>
    </div>
  );
}
