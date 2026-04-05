'use client';

import type { DiscussionPost, Metadata } from '@/lib/types';
import { countries, languages, specialties } from '@/lib/mockData';
import { practiceSettingLabel } from '@/lib/metadataDisplay';

function countryName(code: string): string {
  return countries.find((c) => c.code === code)?.name ?? code;
}

function languageName(code: string): string {
  return languages.find((l) => l.code === code)?.name ?? code;
}

function specialtyLabel(value: string | undefined): string {
  if (!value?.trim()) return '';
  return specialties.find((s) => s.value === value)?.label ?? value;
}

interface DiscussionSubmissionMetaProps {
  metadata: Metadata;
  transcriptionStatus: DiscussionPost['transcriptionStatus'];
  audioUrl?: string;
  /** Use slightly brighter panel for standalone post page */
  variant?: 'forum' | 'page';
}

const panel =
  'rounded-xl border border-white/10 bg-white/[0.04] p-4';
const label =
  'text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-3';
const rowDt = 'text-xs text-white/40 shrink-0';
const rowDd = 'text-xs text-white/75 text-right';

function statusBadgeClass(status: DiscussionPost['transcriptionStatus']): string {
  if (status === 'completed') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'processing') return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
  if (status === 'failed') return 'border-red-500/30 bg-red-500/10 text-red-300';
  return 'border-white/15 bg-white/[0.06] text-white/45';
}

function statusLabel(status: DiscussionPost['transcriptionStatus']): string {
  if (status === 'pending') return 'Queued';
  if (status === 'processing') return 'Transcribing';
  if (status === 'failed') return 'Failed';
  return 'Ready';
}

export default function DiscussionSubmissionMeta({
  metadata,
  transcriptionStatus,
  audioUrl,
  variant = 'forum',
}: DiscussionSubmissionMetaProps) {
  const coords = metadata.coordinates;
  const hasCoords = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';

  const rows: { label: string; value: string }[] = [
    { label: 'Region', value: countryName(metadata.country) },
    { label: 'Career stage', value: metadata.careerStage },
    { label: 'Language', value: languageName(metadata.language) },
    { label: 'Practice setting', value: practiceSettingLabel(metadata.practiceSetting) },
    {
      label: 'Clinical focus',
      value: specialtyLabel(metadata.specialty) || '—',
    },
    { label: 'Group recording', value: metadata.isGroupSubmission ? 'Yes' : 'No' },
    {
      label: 'Location shared',
      value: hasCoords
        ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)} (${metadata.locationSource === 'browser' ? 'browser' : 'provided'})`
        : 'Not shared',
    },
  ];

  const outerGrid =
    variant === 'page'
      ? 'grid gap-4 sm:grid-cols-2'
      : 'grid gap-3 sm:grid-cols-2';

  return (
    <div className={outerGrid}>
      <div className={panel}>
        <p className={label}>Submission details</p>
        <dl className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className={rowDt}>{row.label}</dt>
              <dd className={`${rowDd} max-w-[65%]`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={panel}>
        <p className={label}>Speakers &amp; recording</p>
        <div className="space-y-3">
          {metadata.contributorIdentities?.trim() ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/35 mb-1">
                Who was in the recording
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {metadata.contributorIdentities.trim()}
              </p>
            </div>
          ) : (
            <p className="text-xs text-white/35 italic">No speaker description provided.</p>
          )}

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/35 mb-1.5">
              Transcription
            </p>
            <span
              className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusBadgeClass(transcriptionStatus)}`}
            >
              {statusLabel(transcriptionStatus)}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/35 mb-1">
              Audio storage
            </p>
            <p className="text-xs text-white/45 leading-relaxed">
              {audioUrl?.trim()
                ? 'Recording is stored securely for research use.'
                : 'Voice capture submitted through the study pipeline (no public playback link).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
