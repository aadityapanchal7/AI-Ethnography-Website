/**
 * Batch Transcribe job helpers.
 *
 * Note: `IdentifyLanguage: true` requires KMS encryption on transcript output (AWS requirement).
 * We use explicit LanguageCode instead so output can stay default SSE-S3.
 */

/** ISO 639-1 from the share form → Amazon Transcribe batch LanguageCode */
const ISO_TO_TRANSCRIBE: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ar: 'ar-SA',
  hi: 'hi-IN',
  ru: 'ru-RU',
  it: 'it-IT',
  nl: 'nl-NL',
  sv: 'sv-SE',
  pl: 'pl-PL',
  tr: 'tr-TR',
  th: 'th-TH',
  vi: 'vi-VN',
  id: 'id-ID',
  ms: 'ms-MY',
  tl: 'fil-PH',
  sw: 'sw-KE',
  he: 'he-IL',
  el: 'el-GR',
  cs: 'cs-CZ',
  hu: 'hu-HU',
  ro: 'ro-RO',
  uk: 'uk-UA',
  bn: 'bn-IN',
  ta: 'ta-IN',
};

export function resolveTranscribeLanguageCode(
  metadataLanguage: unknown,
  envFallback?: string
): string {
  const fallback = envFallback?.trim() || 'en-US';
  if (typeof metadataLanguage !== 'string' || !metadataLanguage.trim()) {
    return fallback;
  }
  const raw = metadataLanguage.trim();
  if (raw.includes('-')) {
    return raw;
  }
  const lower = raw.toLowerCase();
  return ISO_TO_TRANSCRIBE[lower] ?? fallback;
}

/** Extension from S3 key → Transcribe MediaFormat (optional on API but improves reliability). */
export function mediaFormatFromAudioKey(audioKey: string): string | undefined {
  const ext = audioKey.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp3: 'mp3',
    mp4: 'mp4',
    m4a: 'mp4',
    wav: 'wav',
    webm: 'webm',
    flac: 'flac',
  };
  return ext ? map[ext] : undefined;
}
