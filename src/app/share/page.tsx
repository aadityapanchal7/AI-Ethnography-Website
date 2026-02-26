'use client';

import { Ubuntu } from 'next/font/google';

import { useState } from 'react';
import ConsentModal from '@/components/ConsentModal';
import MetadataForm from '@/components/MetadataForm';
import AudioRecorder from '@/components/AudioRecorder';
import ReviewSubmit from '@/components/ReviewSubmit';
import BackgroundGlobe from '@/components/BackgroundGlobe';
import type { Metadata, ShareFlowStep } from '@/lib/types';
import { submitTestimonial } from '@/lib/api';

const steps: { id: ShareFlowStep; label: string }[] = [
  { id: 'consent', label: 'Consent' },
  { id: 'metadata', label: 'About You' },
  { id: 'record', label: 'Record' },
  { id: 'review', label: 'Review' },
];

const ubuntu = Ubuntu({
  subsets: ['latin'],
  variable: '--font-ubuntu',
  weight: ["300", "400", "500", "700"]
});

export default function SharePage() {
  const [currentStep, setCurrentStep] = useState<ShareFlowStep>('consent');
  const [consentGiven, setConsentGiven] = useState(false);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleConsent = () => {
    setConsentGiven(true);
    setCurrentStep('metadata');
  };

  const handleMetadataSubmit = (data: Metadata) => {
    setMetadata(data);
    setCurrentStep('record');
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setCurrentStep('review');
  };

  const handleSubmit = async () => {
    if (!metadata || !audioBlob) {
      throw new Error('Missing required data');
    }

    const response = await submitTestimonial({
      metadata,
      audioBlob,
      consentGiven,
    });

    if (!response.success) {
      throw new Error(response.error || 'Submission failed');
    }

    // Success is handled by the ReviewSubmit component
  };

  const handleEditMetadata = () => {
    setCurrentStep('metadata');
  };

  const handleEditRecording = () => {
    setCurrentStep('record');
  };

  return (
    <div className={`min-h-screen bg-black ${ubuntu.className} relative overflow-hidden`}>
      {/* Background Globe */}
      <BackgroundGlobe />

      <div className="relative z-10 min-h-screen flex flex-col bg-black/80">

        {/* ── PAGE HEADER ───────────────────────────── */}
        <div className="bg-black/60 backdrop-blur-md border-b border-white/10 pt-28 pb-10 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38BDF8] mb-3">
              MIT Critical Data · Digital Ethnography
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Share Your Story<span className="text-[#38BDF8]">.</span>
            </h1>
            <p className="mt-3 text-white/50 text-sm leading-relaxed max-w-lg">
              A 5-minute audio or video recording in your own words — your experience with AI in medicine, education, or daily life.
            </p>
          </div>
        </div>

        {/* ── STEPPER ───────────────────────────────── */}
        <div className="bg-black/80 backdrop-blur-sm border-b border-white/10 px-6 py-5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-0">
              {steps.map((step, index) => {
                const isActive = currentStepIndex === index;
                const isComplete = currentStepIndex > index;
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    {/* step */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all ${isComplete
                          ? 'bg-white text-black'
                          : isActive
                            ? 'bg-[#38BDF8] text-black ring-4 ring-[#38BDF8]/20'
                            : 'bg-white/10 text-white/30'
                          }`}
                      >
                        {isComplete ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-white/30'}`}>
                        {step.label}
                      </span>
                    </div>
                    {/* connector */}
                    {index < steps.length - 1 && (
                      <div className={`mx-3 flex-1 h-px transition-colors ${isComplete ? 'bg-white/40' : 'bg-white/10'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── STEP CONTENT ──────────────────────────── */}
        <main className="flex-1 flex flex-col bg-black/80">
          <div className="max-w-3xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 flex-1 flex flex-col">

              {currentStep === 'consent' && (
                <ConsentModal
                  onConsent={handleConsent}
                  onClose={() => window.location.href = '/'}
                />
              )}

              {currentStep === 'metadata' && (
                <MetadataForm
                  initialData={metadata || undefined}
                  onSubmit={handleMetadataSubmit}
                  onBack={() => setCurrentStep('consent')}
                />
              )}

              {currentStep === 'record' && (
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onBack={() => setCurrentStep('metadata')}
                  existingBlob={audioBlob}
                />
              )}

              {currentStep === 'review' && metadata && audioBlob && (
                <ReviewSubmit
                  metadata={metadata}
                  audioBlob={audioBlob}
                  onSubmit={handleSubmit}
                  onEditMetadata={handleEditMetadata}
                  onEditRecording={handleEditRecording}
                />
              )}

            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
