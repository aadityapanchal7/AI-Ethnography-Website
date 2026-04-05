import type { Metadata, PracticeSetting } from './types';

export const PRACTICE_SETTING_LABELS: Record<PracticeSetting, string> = {
  academic: 'Academic Medical Center',
  community: 'Community Hospital',
  rural: 'Rural/Remote Practice',
  private: 'Private Practice',
  urban: 'Urban Clinic',
  government: 'Government / Public Health',
  other: 'Other',
};

export function practiceSettingLabel(value: string | undefined): string {
  if (!value?.trim()) return '—';
  return PRACTICE_SETTING_LABELS[value as PracticeSetting] ?? value;
}
