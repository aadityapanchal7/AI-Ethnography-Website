'use client';

import { useState } from 'react';
import ConsentModal from '@/components/ConsentModal';
import MetadataForm from '@/components/MetadataForm';
import AudioRecorder from '@/components/AudioRecorder';
import ReviewSubmit from '@/components/ReviewSubmit';
import type { Metadata, ShareFlowStep } from '@/lib/types';
import { submitTestimonial } from '@/lib/api';

const steps: { id: ShareFlowStep; label: string }[] = [
  { id: 'consent', label: 'Consent' },
  { id: 'metadata', label: 'About You' },
  { id: 'record', label: 'Record' },
  { id: 'review', label: 'Review' },
];

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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}

      {/* Progress Indicator */}
      {currentStep !== 'consent' && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            {steps.slice(1).map((step, index) => {
              const stepIndex = index + 1;
              const isActive = currentStepIndex === stepIndex;
              const isComplete = currentStepIndex > stepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        isComplete
                          ? 'bg-linear-to-br from-green-400 to-emerald-600 text-white'
                          : isActive
                            ? 'bg-linear-to-br from-blue-500 to-purple-600 text-white ring-4 ring-blue-500/30'
                            : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isComplete ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepIndex
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 2 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded ${
                        currentStepIndex > stepIndex + 1 ? 'bg-green-500' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50 p-6 sm:p-8">
          {/* Consent Step */}
          {currentStep === 'consent' && (
            <ConsentModal
              isOpen={true}
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
  );
}
