'use client';

import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useEffect, useRef } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onBack: () => void;
  existingBlob?: Blob | null;
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioRecorder({ onRecordingComplete, onBack, existingBlob }: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    duration,
    timeRemaining,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecorder();

  const audioRef = useRef<HTMLAudioElement>(null);

  // If there's an existing blob, allow proceeding directly
  const hasRecording = audioBlob || existingBlob;
  const displayUrl = audioUrl || (existingBlob ? URL.createObjectURL(existingBlob) : null);

  // Calculate progress percentage for the timer ring
  const maxDuration = 5 * 60; // 5 minutes
  const progress = Math.min((duration / maxDuration) * 100, 100);

  const handleContinue = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    } else if (existingBlob) {
      onRecordingComplete(existingBlob);
    }
  };

  // Cleanup URL on unmount if we created one
  useEffect(() => {
    return () => {
      if (existingBlob && displayUrl && displayUrl !== audioUrl) {
        URL.revokeObjectURL(displayUrl);
      }
    };
  }, [existingBlob, displayUrl, audioUrl]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Record Your Experience</h2>
        <p className="text-slate-400">
          Share how AI has impacted your medical practice (up to 5 minutes)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Prompts/Tips */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
        <h3 className="font-medium text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Things to consider sharing:
        </h3>
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            A specific moment when AI made a difference in your practice
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            Challenges or concerns you&apos;ve encountered with AI tools
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            How AI has changed your workflow or patient interactions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            Your hopes or worries about the future of AI in medicine
          </li>
        </ul>
      </div>

      {/* Timer Display */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          {/* Background ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-700"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-200"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isRecording ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-sm text-slate-400">{isPaused ? 'Paused' : 'Recording'}</span>
                </div>
                <span className="text-3xl font-mono font-bold text-white">{formatTime(duration)}</span>
                <span className="text-xs text-slate-500 mt-1">{formatTime(timeRemaining)} remaining</span>
              </>
            ) : hasRecording ? (
              <>
                <svg className="w-8 h-8 text-green-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-3xl font-mono font-bold text-white">{formatTime(duration || 0)}</span>
                <span className="text-xs text-slate-400 mt-1">Recording complete</span>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-sm text-slate-400">Ready to record</span>
                <span className="text-xs text-slate-500">5 min max</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        {!isRecording && !hasRecording && (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-linear-to-r from-red-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-pink-700 transition-all hover:scale-105"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
            </svg>
          </button>
        )}

        {isRecording && (
          <>
            {/* Pause/Resume */}
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-14 h-14 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-all"
            >
              {isPaused ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </button>

            {/* Stop */}
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-linear-to-r from-red-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-pink-700 transition-all hover:scale-105"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          </>
        )}

        {hasRecording && !isRecording && (
          <>
            {/* Re-record */}
            <button
              onClick={resetRecording}
              className="w-14 h-14 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-all"
              title="Re-record"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Audio Playback */}
      {displayUrl && !isRecording && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Preview your recording
          </h3>
          <audio
            ref={audioRef}
            src={displayUrl}
            controls
            className="w-full h-12"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 rounded-xl font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasRecording || isRecording}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
            hasRecording && !isRecording
              ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
