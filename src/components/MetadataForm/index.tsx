'use client';

import { useState, useMemo } from 'react';
import type { Metadata, CareerStage, PracticeSetting } from '@/lib/types';
import { countries, languages, specialties } from '@/lib/mockData';

interface MetadataFormProps {
  initialData?: Partial<Metadata>;
  onSubmit: (data: Metadata) => void;
  onBack: () => void;
}

const careerStages: { value: CareerStage; label: string; description: string }[] = [
  { value: 'Trainee', label: 'Trainee', description: 'Medical student, resident, or fellow' },
  { value: 'Early-career', label: 'Early-career', description: '0-5 years in practice' },
  { value: 'Mid-career', label: 'Mid-career', description: '6-15 years in practice' },
  { value: 'Senior', label: 'Senior', description: '15+ years in practice' },
];

const practiceSettings: { value: PracticeSetting; label: string }[] = [
  { value: 'academic', label: 'Academic Medical Center' },
  { value: 'community', label: 'Community Hospital' },
  { value: 'rural', label: 'Rural/Remote Practice' },
  { value: 'private', label: 'Private Practice' },
  { value: 'urban', label: 'Urban Clinic' },
  { value: 'government', label: 'Government/Public Health' },
  { value: 'other', label: 'Other' },
];

type GeoStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unsupported';

export default function MetadataForm({ initialData, onSubmit, onBack }: MetadataFormProps) {
  const [formData, setFormData] = useState<Partial<Metadata>>({
    country: initialData?.country || '',
    careerStage: initialData?.careerStage || undefined,
    specialty: initialData?.specialty || '',
    language: initialData?.language || '',
    practiceSetting: initialData?.practiceSetting || undefined,
    coordinates: initialData?.coordinates,
    locationSource: initialData?.locationSource,
    isGroupSubmission: initialData?.isGroupSubmission ?? false,
    contributorIdentities: initialData?.contributorIdentities || '',
  });

  const [searchCountry, setSearchCountry] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof Metadata, string>>>({});
  const [geoStatus, setGeoStatus] = useState<GeoStatus>(
    initialData?.coordinates ? 'granted' : 'idle'
  );

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchCountry) return countries;
    const search = searchCountry.toLowerCase();
    return countries.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.code.toLowerCase().includes(search)
    );
  }, [searchCountry]);

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchLanguage) return languages;
    const search = searchLanguage.toLowerCase();
    return languages.filter(l =>
      l.name.toLowerCase().includes(search) ||
      l.code.toLowerCase().includes(search)
    );
  }, [searchLanguage]);

  // Filter specialties based on search
  const filteredSpecialties = useMemo(() => {
    if (!searchSpecialty) return specialties;
    const search = searchSpecialty.toLowerCase();
    return specialties.filter(s =>
      s.label.toLowerCase().includes(search)
    );
  }, [searchSpecialty]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Metadata, string>> = {};

    if (!formData.country) {
      newErrors.country = 'Select the country or region your group is primarily based in';
    }
    if (!formData.isGroupSubmission) {
      newErrors.isGroupSubmission =
        'This archive collects group dialogues — please confirm your recording is from a group.';
    }
    if (!formData.contributorIdentities?.trim()) {
      newErrors.contributorIdentities =
        'Describe who is speaking (approximate ages and how each person identifies).';
    }
    if (!formData.careerStage) {
      newErrors.careerStage = 'Pick the closest representative career stage for the group';
    }
    if (!formData.language) {
      newErrors.language = 'Select the primary language spoken in the recording';
    }
    if (!formData.practiceSetting) {
      newErrors.practiceSetting = 'Select the setting that best fits your group’s context';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const requestBrowserLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }
    setGeoStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          locationSource: 'browser',
        }));
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 600_000 }
    );
  };

  const clearBrowserLocation = () => {
    setFormData((prev) => {
      const next = { ...prev };
      delete next.coordinates;
      delete next.locationSource;
      return next;
    });
    setGeoStatus('idle');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const spec = formData.specialty?.trim();
    onSubmit({
      country: formData.country!,
      careerStage: formData.careerStage!,
      language: formData.language!,
      practiceSetting: formData.practiceSetting!,
      isGroupSubmission: true,
      contributorIdentities: formData.contributorIdentities!.trim(),
      specialty: spec || undefined,
      coordinates: formData.coordinates,
      locationSource: formData.locationSource,
    });
  };

  const selectedCountry = countries.find(c => c.code === formData.country);
  const selectedLanguage = languages.find(l => l.code === formData.language);
  const selectedSpecialty = specialties.find(s => s.value === formData.specialty);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">About your group</h2>
        <p className="text-slate-400">
          Geolocation, who is speaking, language, and career context — we do not accept solo individual submissions for this study.
        </p>
      </div>

      {/* Country Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Country or region of the group <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
          />
          {searchCountry && filteredCountries.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-slate-900 border border-white/10 rounded-xl shadow-xl">
              {filteredCountries.slice(0, 10).map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, country: country.code }));
                    setSearchCountry('');
                    setErrors(prev => ({ ...prev, country: undefined }));
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl"
                >
                  {country.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCountry?.name && (
          <div className="flex items-center justify-between px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg">
            <span className="text-white">{selectedCountry.name}</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, country: '' }))}
              className="text-[#3B82F6] hover:text-white"
            >
              Change
            </button>
          </div>
        )}
        {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
      </div>

      {/* Group affirmation */}
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-left">
          <input
            type="checkbox"
            checked={Boolean(formData.isGroupSubmission)}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, isGroupSubmission: e.target.checked }));
              setErrors((prev) => ({ ...prev, isGroupSubmission: undefined }));
            }}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-[#3B82F6] focus:ring-[#3B82F6]/50"
          />
          <span className="text-sm text-white/90 leading-relaxed">
            <span className="font-medium text-white">This is a group submission.</span> The recording captures a dialogue with{' '}
            <span className="text-white">more than one person</span> contributing (not a solo individual voice note).
          </span>
        </label>
        {errors.isGroupSubmission && (
          <p className="text-red-500 text-sm">{errors.isGroupSubmission}</p>
        )}

        <div className="space-y-2 pt-1">
          <label className="block text-sm font-medium text-white">
            Who is speaking? <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500">
            For each person heard in the recording, share approximate age or age range and how they identify, as your group is comfortable sharing.
          </p>
          <textarea
            value={formData.contributorIdentities ?? ''}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, contributorIdentities: e.target.value }));
              setErrors((prev) => ({ ...prev, contributorIdentities: undefined }));
            }}
            rows={4}
            placeholder="e.g. Person A — early 30s, community health worker; Person B — 50s, nurse; …"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
          />
          {errors.contributorIdentities && (
            <p className="text-red-500 text-sm">{errors.contributorIdentities}</p>
          )}
        </div>
      </div>

      {/* Career Stage */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Representative career stage for the group <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {careerStages.map((stage) => (
            <button
              key={stage.value}
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, careerStage: stage.value }));
                setErrors(prev => ({ ...prev, careerStage: undefined }));
              }}
              className={`p-4 rounded-xl border text-left transition-all ${formData.careerStage === stage.value
                ? 'bg-[#3B82F6]/20 border-[#3B82F6] ring-2 ring-[#3B82F6]/30'
                : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
            >
              <div className="font-medium text-white">{stage.label}</div>
              <div className="text-xs text-slate-400 mt-1">{stage.description}</div>
            </button>
          ))}
        </div>
        {errors.careerStage && <p className="text-red-500 text-sm">{errors.careerStage}</p>}
      </div>

      {/* Specialty */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Specialty <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search specialties..."
            value={searchSpecialty}
            onChange={(e) => setSearchSpecialty(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
          />
          {searchSpecialty && filteredSpecialties.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-slate-900 border border-white/10 rounded-xl shadow-xl">
              {filteredSpecialties.slice(0, 10).map((specialty) => (
                <button
                  key={specialty.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, specialty: specialty.value }));
                    setSearchSpecialty('');
                    setErrors(prev => ({ ...prev, specialty: undefined }));
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl"
                >
                  {specialty.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedSpecialty?.label && (
          <div className="flex items-center justify-between px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg">
            <span className="text-white">{selectedSpecialty.label}</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, specialty: '' }))}
              className="text-[#3B82F6] hover:text-white"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Primary language in the recording <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500">The platform will support translation over time; this helps transcription and display.</p>
        <div className="relative">
          <input
            type="text"
            placeholder="Search languages..."
            value={searchLanguage}
            onChange={(e) => setSearchLanguage(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
          />
          {searchLanguage && filteredLanguages.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-slate-900 border border-white/10 rounded-xl shadow-xl">
              {filteredLanguages.slice(0, 10).map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, language: language.code }));
                    setSearchLanguage('');
                    setErrors(prev => ({ ...prev, language: undefined }));
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl"
                >
                  {language.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedLanguage?.name && (
          <div className="flex items-center justify-between px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg">
            <span className="text-white">{selectedLanguage.name}</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, language: '' }))}
              className="text-[#3B82F6] hover:text-white"
            >
              Change
            </button>
          </div>
        )}
        {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
      </div>

      {/* Practice Setting */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Practice Setting <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {practiceSettings.map((setting) => (
            <button
              key={setting.value}
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, practiceSetting: setting.value }));
                setErrors(prev => ({ ...prev, practiceSetting: undefined }));
              }}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${formData.practiceSetting === setting.value
                ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white ring-2 ring-[#3B82F6]/30'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                }`}
            >
              {setting.label}
            </button>
          ))}
        </div>
        {errors.practiceSetting && <p className="text-red-500 text-sm">{errors.practiceSetting}</p>}
      </div>

      {/* Map location (optional, browser geolocation with consent) */}
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <label className="block text-sm font-medium text-white">
          Geolocation for the map <span className="font-normal text-white/40">(optional)</span>
        </label>
        <p className="text-xs text-white/50 leading-relaxed">
          Optional approximate browser location so your group’s story can appear as a pin on the global map. Country/region above is still stored either way.
        </p>
        {geoStatus === 'unsupported' && (
          <p className="text-xs text-amber-200/80">This browser does not support location.</p>
        )}
        {geoStatus === 'denied' && (
          <p className="text-xs text-amber-200/80">Location was not shared. You can try again or continue without it.</p>
        )}
        {formData.coordinates && (
          <p className="font-mono text-xs text-[#38BDF8]">
            {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}{' '}
            <span className="text-white/35">(from browser, approximate)</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={requestBrowserLocation}
            disabled={geoStatus === 'pending'}
            className="rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-4 py-2 text-sm font-medium text-[#7DD3FC] transition-colors hover:bg-[#38BDF8]/20 disabled:opacity-50"
          >
            {geoStatus === 'pending' ? 'Requesting…' : 'Use my location'}
          </button>
          {formData.coordinates && (
            <button
              type="button"
              onClick={clearBrowserLocation}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
            >
              Remove location
            </button>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 rounded-xl font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-slate-950 hover:bg-slate-100 shadow-lg transition-all"
        >
          Continue to Recording
        </button>
      </div>
    </form>
  );
}
