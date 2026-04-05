'use client';

import { useState } from 'react';

interface ConsentModalProps {
  onConsent: () => void;
  onClose: () => void;
}

export default function ConsentModal({ onConsent, onClose }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (agreed) {
      onConsent();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8 overflow-y-auto pr-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Research Consent</h2>
            <p className="text-slate-400 text-sm">Please read carefully before proceeding</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-2">About This Research</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your submission will contribute to understanding how groups experience AI in health and care.
              Contributions are <span className="text-slate-300">audio or video recordings only</span> (no typed uploads), typically 3–5 minutes, to preserve tone and reduce synthetic text submissions.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-2">How Your Data Will Be Used</h3>
            <ul className="text-slate-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Audio recordings may be transcribed and analyzed for themes</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Highlights and quotes may be shared publicly (anonymized)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Metadata is used for geographic and demographic visualization</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Your identity will never be disclosed without explicit consent</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-semibold text-amber-500 text-sm">Important Note</h4>
                <p className="text-amber-200/70 text-sm mt-1">
                  Please do not share any patient-identifiable information in your recording.
                  Focus on your professional experience rather than specific patient cases.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-400 text-sm leading-relaxed">
              I understand that my submission will be used for research purposes. I confirm that
              my recording does not contain any patient-identifiable information, and I consent
              to having my experience shared as part of this research initiative.
            </span>
          </label>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-xl font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleContinue}
          disabled={!agreed}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${agreed
            ? 'bg-white text-slate-950 hover:bg-slate-100'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
