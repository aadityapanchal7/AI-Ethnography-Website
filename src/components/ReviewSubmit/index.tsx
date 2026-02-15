'use client';

import { useState, useRef, useEffect } from 'react';
import type { Metadata } from '@/lib/types';
import { countries, languages, specialties } from '@/lib/mockData';

interface ReviewSubmitProps {
  metadata: Metadata;
  audioBlob: Blob;
  onSubmit: () => Promise<void>;
  onEditMetadata: () => void;
  onEditRecording: () => void;
}

const careerStageLabels: Record<string, string> = {
  'Trainee': 'Trainee',
  'Early-career': 'Early-career (0-5 years)',
  'Mid-career': 'Mid-career (6-15 years)',
  'Senior': 'Senior (15+ years)',
};

const practiceSettingLabels: Record<string, string> = {
  academic: 'Academic Medical Center',
  community: 'Community Hospital',
  rural: 'Rural/Remote Practice',
  private: 'Private Practice',
  urban: 'Urban Clinic',
  government: 'Government/Public Health',
  other: 'Other',
};

export default function ReviewSubmit({
  metadata,
  audioBlob,
  onSubmit,
  onEditMetadata,
  onEditRecording,
}: ReviewSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Create object URL for audio playback
  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit();
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display names
  const countryName = countries.find(c => c.code === metadata.country)?.name || metadata.country;
  const languageName = languages.find(l => l.code === metadata.language)?.name || metadata.language;
  const specialtyName = specialties.find(s => s.value === metadata.specialty)?.label || metadata.specialty;

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
        <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
          Your experience has been submitted successfully. Your contribution helps us understand
          how AI is impacting medicine worldwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/explore"
            className="px-8 py-3 rounded-xl font-medium bg-white text-slate-950 hover:bg-slate-100 shadow-lg transition-all"
          >
            Explore Experiences
          </a>
          <a
            href="/"
            className="px-8 py-3 rounded-xl font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Submission</h2>
        <p className="text-slate-400">Please verify everything looks correct before submitting</p>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      {/* Metadata Summary */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Your Information
          </h3>
          <button
            onClick={onEditMetadata}
            className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="p-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">Country</dt>
              <dd className="text-white mt-1">{countryName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">Career Stage</dt>
              <dd className="text-white mt-1">{careerStageLabels[metadata.careerStage]}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">Specialty</dt>
              <dd className="text-white mt-1">{specialtyName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide">Language</dt>
              <dd className="text-white mt-1">{languageName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500 uppercase tracking-wide">Practice Setting</dt>
              <dd className="text-white mt-1">{practiceSettingLabels[metadata.practiceSetting]}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Audio Recording */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Your Recording
          </h3>
          <button
            onClick={onEditRecording}
            className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
          >
            Re-record
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <div className="text-white font-medium">Audio Recording</div>
              <div className="text-sm text-slate-500">
                {(audioBlob.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full h-12"
              style={{ colorScheme: 'dark' }}
            />
          )}
        </div>
      </div>

      {/* Consent Reminder */}
      <div className="bg-[#3B82F6]/10 rounded-xl p-4 border border-[#3B82F6]/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[#3B82F6] text-sm leading-relaxed">
            By submitting, you confirm that your recording does not contain patient-identifiable
            information and consent to its use for research purposes as described in the consent form.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${isSubmitting
            ? 'bg-slate-800 text-slate-500 cursor-wait'
            : 'bg-white text-slate-950 hover:bg-slate-100'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Your Experience'
          )}
        </button>
      </div>
    </div>
  );
}
