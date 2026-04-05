'use client';

import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import {
  MAX_AUDIO_UPLOAD_BYTES,
  normalizeAudioContentType,
} from '@/lib/audioUpload';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onBack: () => void;
  existingBlob?: Blob | null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const FILE_INPUT_ACCEPT =
  'audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/mp4,audio/x-m4a,audio/m4a,.mp3,.wav,.webm,.m4a,.mp4';

export default function AudioRecorder({ onRecordingComplete, onBack, existingBlob }: AudioRecorderProps) {
  const gradientId = `ar-grad-${useId().replace(/:/g, '')}`;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [existingPreviewUrl, setExistingPreviewUrl] = useState<string | null>(null);

  const effectiveBlob = audioBlob ?? uploadedBlob ?? existingBlob ?? null;
  const hasRecording = !!effectiveBlob;
  const isFromUpload = !!uploadedBlob && !audioBlob;

  useEffect(() => {
    if (!uploadedBlob) {
      setUploadPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(uploadedBlob);
    setUploadPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedBlob]);

  useEffect(() => {
    if (!existingBlob) {
      setExistingPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(existingBlob);
    setExistingPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [existingBlob]);

  const displayUrl =
    !isRecording && (audioUrl || uploadPreviewUrl || existingPreviewUrl || null);

  const maxDuration = 5 * 60;
  const progress = Math.min((duration / maxDuration) * 100, 100);

  useEffect(() => {
    if (!uploadedBlob) return;
    const url = URL.createObjectURL(uploadedBlob);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;
    const onMeta = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > maxDuration + 0.5) {
        setUploadError('That file is longer than 5 minutes. Trim the clip or record a shorter take (target roughly 3–5 minutes).');
        setUploadedBlob(null);
        setUploadFileName(null);
      }
      URL.revokeObjectURL(url);
    };
    const onErr = () => URL.revokeObjectURL(url);
    audio.addEventListener('loadedmetadata', onMeta, { once: true });
    audio.addEventListener('error', onErr, { once: true });
    void audio.load();
    return () => {
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('error', onErr);
      audio.src = '';
    };
  }, [uploadedBlob, maxDuration]);

  const clearUpload = useCallback(() => {
    setUploadedBlob(null);
    setUploadFileName(null);
    setUploadError(null);
  }, []);

  const handleStartRecording = useCallback(async () => {
    clearUpload();
    await startRecording();
  }, [clearUpload, startRecording]);

  const handleResetAll = useCallback(() => {
    resetRecording();
    clearUpload();
  }, [resetRecording, clearUpload]);

  const handleFileSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      setUploadError(null);

      if (!file) return;

      if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
        setUploadError(
          `File is too large (max ${Math.round(MAX_AUDIO_UPLOAD_BYTES / 1024 / 1024)} MB). Try a shorter clip or lower quality.`
        );
        return;
      }

      const contentType = normalizeAudioContentType(file);
      if (!contentType) {
        setUploadError(
          'Unsupported format. Use MP3, WAV, WebM, or M4A (AAC in MP4 container).'
        );
        return;
      }

      resetRecording();
      const blob =
        file.type.split(';')[0].trim().toLowerCase() === contentType.toLowerCase()
          ? file
          : new File([file], file.name, { type: contentType });

      setUploadedBlob(blob);
      setUploadFileName(file.name);
    },
    [resetRecording]
  );

  const handleContinue = () => {
    if (effectiveBlob) {
      onRecordingComplete(effectiveBlob);
    }
  };

  const combinedError = error || uploadError;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Record or upload audio</h2>
        <p className="text-slate-400">
          Voice or video-as-audio only (no typed stories). Aim for roughly 3–5 minutes; hard cap 5 minutes for live recording and uploads — MP3, WAV, WebM, or M4A.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_INPUT_ACCEPT}
        className="sr-only"
        aria-label="Upload audio file"
        onChange={handleFileSelected}
      />

      {combinedError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{combinedError}</p>
        </div>
      )}

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="font-medium text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Before you hit record
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Use the <span className="text-white/80">story prompts</span> on this page to guide your group conversation. You don’t need to answer every question — pick what fits your group’s experience with AI and health.
        </p>
      </div>

      {!isRecording && !hasRecording && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-sm rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3.5 text-sm font-medium text-white hover:bg-white/[0.1] transition-colors"
          >
            Upload audio file
          </button>
          <p className="text-[11px] text-slate-500">Max {Math.round(MAX_AUDIO_UPLOAD_BYTES / 1024 / 1024)} MB · same formats as recording pipeline</p>
        </div>
      )}

      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-800"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-200"
            />
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
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
                <svg className="w-8 h-8 text-green-500 mb-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-2xl font-mono font-bold text-white">
                  {isFromUpload ? '—' : formatTime(duration || 0)}
                </span>
                <span className="text-xs text-slate-500 mt-1 line-clamp-2 px-1">
                  {isFromUpload
                    ? uploadFileName
                      ? `Uploaded: ${uploadFileName}`
                      : 'Audio file ready'
                    : 'Recording complete'}
                </span>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-sm text-slate-400">Record or upload</span>
                <span className="text-xs text-slate-500">5 min max (live)</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {!isRecording && !hasRecording && (
          <button
            type="button"
            onClick={() => void handleStartRecording()}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-pink-700 transition-all hover:scale-105"
            title="Start recording"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
            </svg>
          </button>
        )}

        {isRecording && (
          <>
            <button
              type="button"
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-all shadow-sm"
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

            <button
              type="button"
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-pink-700 transition-all hover:scale-105"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          </>
        )}

        {hasRecording && !isRecording && (
          <button
            type="button"
            onClick={handleResetAll}
            className="w-14 h-14 rounded-full bg-slate-800 text-white border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-all shadow-sm"
            title="Clear and start over"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {hasRecording && !isRecording && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-[#93C5FD] hover:text-white underline-offset-2 hover:underline"
          >
            Replace with a different file
          </button>
        </div>
      )}

      {displayUrl && !isRecording && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Preview
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

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 rounded-xl font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasRecording || isRecording}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${hasRecording && !isRecording
            ? 'bg-white text-slate-950 hover:bg-slate-100'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
