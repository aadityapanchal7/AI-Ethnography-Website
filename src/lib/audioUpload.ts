/** Matches backend `presign-upload` ALLOWED_TYPES (base MIME, no params). */
const EXT_TO_MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  webm: 'audio/webm',
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
};

const ALLOWED_BASE = new Set(Object.values(EXT_TO_MIME));

/**
 * Normalize file type for S3 presign + Transcribe. Returns null if the file cannot be mapped to an allowed type.
 */
export function normalizeAudioContentType(file: File): string | null {
  const raw = (file.type || '').split(';')[0].trim().toLowerCase();
  if (raw === 'audio/mp3' || raw === 'audio/x-mp3') return 'audio/mpeg';
  if (raw === 'audio/x-wav' || raw === 'audio/wave') return 'audio/wav';
  if (raw === 'audio/x-m4a' || raw === 'audio/m4a') return 'audio/mp4';
  if (raw && ALLOWED_BASE.has(raw)) return raw;

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return null;
}

export const MAX_AUDIO_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
