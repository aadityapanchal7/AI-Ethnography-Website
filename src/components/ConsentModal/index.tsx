'use client';

import { useState } from 'react';

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
  onClose: () => void;
}

export default function ConsentModal({ isOpen, onConsent, onClose }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (agreed) {
      onConsent();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700/50">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Research Consent</h2>
              <p className="text-slate-400 text-sm">Please read carefully before proceeding</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
            <h3 className="font-semibold text-white mb-2">About This Research</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your submission will contribute to understanding how healthcare professionals 
              experience AI in their practice. This research aims to capture diverse perspectives 
              from medical professionals worldwide.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
            <h3 className="font-semibold text-white mb-2">How Your Data Will Be Used</h3>
            <ul className="text-slate-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Audio recordings may be transcribed and analyzed for themes</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Highlights and quotes may be shared publicly (anonymized)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Metadata is used for geographic and demographic visualization</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Your identity will never be disclosed without explicit consent</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-semibold text-amber-400 text-sm">Important Note</h4>
                <p className="text-amber-200/80 text-sm mt-1">
                  Please do not share any patient-identifiable information in your recording. 
                  Focus on your professional experience rather than specific patient cases.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <span className="text-slate-200 text-sm leading-relaxed">
              I understand that my submission will be used for research purposes. I confirm that 
              my recording does not contain any patient-identifiable information, and I consent 
              to having my experience shared as part of this research initiative.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!agreed}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              agreed
                ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
