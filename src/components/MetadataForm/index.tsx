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

export default function MetadataForm({ initialData, onSubmit, onBack }: MetadataFormProps) {
  const [formData, setFormData] = useState<Partial<Metadata>>({
    country: initialData?.country || '',
    careerStage: initialData?.careerStage || undefined,
    specialty: initialData?.specialty || '',
    language: initialData?.language || '',
    practiceSetting: initialData?.practiceSetting || undefined,
  });

  const [searchCountry, setSearchCountry] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof Metadata, string>>>({});

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
      newErrors.country = 'Please select your country';
    }
    if (!formData.careerStage) {
      newErrors.careerStage = 'Please select your career stage';
    }
    if (!formData.specialty) {
      newErrors.specialty = 'Please select your specialty';
    }
    if (!formData.language) {
      newErrors.language = 'Please select your preferred language';
    }
    if (!formData.practiceSetting) {
      newErrors.practiceSetting = 'Please select your practice setting';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as Metadata);
    }
  };

  const selectedCountry = countries.find(c => c.code === formData.country);
  const selectedLanguage = languages.find(l => l.code === formData.language);
  const selectedSpecialty = specialties.find(s => s.value === formData.specialty);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Yourself</h2>
        <p className="text-slate-400">This information helps us understand your perspective</p>
      </div>

      {/* Country Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Country <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          {searchCountry && filteredCountries.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              {filteredCountries.slice(0, 10).map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, country: country.code }));
                    setSearchCountry('');
                    setErrors(prev => ({ ...prev, country: undefined }));
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl"
                >
                  {country.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCountry && (
          <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-blue-300">{selectedCountry.name}</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, country: '' }))}
              className="text-blue-400 hover:text-blue-300"
            >
              Change
            </button>
          </div>
        )}
        {errors.country && <p className="text-red-400 text-sm">{errors.country}</p>}
      </div>

      {/* Career Stage */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">
          Career Stage <span className="text-red-400">*</span>
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
              className={`p-4 rounded-xl border text-left transition-all ${
                formData.careerStage === stage.value
                  ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="font-medium text-white">{stage.label}</div>
              <div className="text-xs text-slate-400 mt-1">{stage.description}</div>
            </button>
          ))}
        </div>
        {errors.careerStage && <p className="text-red-400 text-sm">{errors.careerStage}</p>}
      </div>

      {/* Specialty */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Specialty <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search specialties..."
            value={searchSpecialty}
            onChange={(e) => setSearchSpecialty(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          {searchSpecialty && filteredSpecialties.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              {filteredSpecialties.slice(0, 10).map((specialty) => (
                <button
                  key={specialty.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, specialty: specialty.value }));
                    setSearchSpecialty('');
                    setErrors(prev => ({ ...prev, specialty: undefined }));
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl"
                >
                  {specialty.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedSpecialty && (
          <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-blue-300">{selectedSpecialty.label}</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, specialty: '' }))}
              className="text-blue-400 hover:text-blue-300"
            >
              Change
            </button>
          </div>
        )}
        {errors.specialty && <p className="text-red-400 text-sm">{errors.specialty}</p>}
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Preferred Language for Recording <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search languages..."
            value={searchLanguage}
            onChange={(e) => setSearchLanguage(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          {searchLanguage && filteredLanguages.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              {filteredLanguages.slice(0, 10).map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, language: language.code }));
                    setSearchLanguage('');
                    setErrors(prev => ({ ...prev, language: undefined }));
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl"
                >
                  {language.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedLanguage && (
          <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-blue-300">{selectedLanguage.name}</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, language: '' }))}
              className="text-blue-400 hover:text-blue-300"
            >
              Change
            </button>
          </div>
        )}
        {errors.language && <p className="text-red-400 text-sm">{errors.language}</p>}
      </div>

      {/* Practice Setting */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">
          Practice Setting <span className="text-red-400">*</span>
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
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                formData.practiceSetting === setting.value
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/50'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              {setting.label}
            </button>
          ))}
        </div>
        {errors.practiceSetting && <p className="text-red-400 text-sm">{errors.practiceSetting}</p>}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 rounded-xl font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 rounded-xl font-medium bg-linear-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all"
        >
          Continue to Recording
        </button>
      </div>
    </form>
  );
}
