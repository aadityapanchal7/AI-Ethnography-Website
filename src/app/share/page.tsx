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
    <div className={`min-h-screen bg-gradient-to-br from-[#020617] via-[#050B14] to-[#0A1628] ${ubuntu.className} relative overflow-hidden`}>
      {/* Background Globe */}
      <BackgroundGlobe />

      <div className="relative z-10 min-h-screen flex flex-col pt-28">
        {/* Main Content */}
        <main className="max-w-2xl mx-auto w-full px-4 pb-20 flex-1 flex flex-col">
          <div className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-sm flex-1 flex flex-col">
            {/* Progress Indicator */}
            <div className="w-full mb-10">
              <div className="flex items-start justify-between">
                {steps.map((step, index) => {
                  const stepIndex = index;
                  const isActive = currentStepIndex === stepIndex;
                  const isComplete = currentStepIndex > stepIndex;

                  return (
                    <div key={step.id} className="flex-1 relative">
                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute left-1/2 w-full top-5 h-0.5 transition-colors duration-300 ${currentStepIndex > stepIndex ? 'bg-white' : 'bg-slate-800'
                            }`}
                        />
                      )}

                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all shadow-sm ${isComplete
                            ? 'bg-white text-slate-950'
                            : isActive
                              ? 'bg-[#3B82F6] text-white ring-4 ring-[#3B82F6]/20'
                              : 'bg-slate-800 text-slate-500 border border-white/5'
                            }`}
                        >
                          {isComplete ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consent Step */}
            {currentStep === 'consent' && (
              <ConsentModal
                onConsent={handleConsent}
                onClose={() => window.location.href = '/'}
              />
            )}

            {/* Metadata Step */}
            {currentStep === 'metadata' && (
              <MetadataForm
                initialData={metadata || undefined}
                onSubmit={handleMetadataSubmit}
                onBack={() => setCurrentStep('consent')}
              />
            )}

            {/* Recording Step */}
            {currentStep === 'record' && (
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                onBack={() => setCurrentStep('metadata')}
                existingBlob={audioBlob}
              />
            )}

            {/* Review Step */}
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
        </main>
      </div>
    </div>
  );
}
