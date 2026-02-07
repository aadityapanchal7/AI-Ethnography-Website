// Core TypeScript interfaces for AI in Medicine Experiences platform

// Career stage options
export type CareerStage = 'Trainee' | 'Early-career' | 'Mid-career' | 'Senior';

// Practice setting options
export type PracticeSetting = 
  | 'academic' 
  | 'community' 
  | 'rural' 
  | 'private' 
  | 'urban' 
  | 'government'
  | 'other';

// Core metadata interface matching standardized fields
export interface Metadata {
  country: string;        // ISO 3166-1 alpha-2 code
  careerStage: CareerStage;
  specialty: string;      // Controlled vocabulary
  language: string;       // ISO 639-1 code
  practiceSetting: PracticeSetting;
}

// Geographic coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Full testimonial record
export interface Testimonial {
  id: string;
  metadata: Metadata;
  audioUrl?: string;      // S3 URL (future)
  highlight: string;      // One-line excerpt/summary
  submittedAt: string;    // ISO 8601 timestamp
  coordinates: Coordinates;
  themeIds?: string[];    // Associated theme IDs
}

// Theme categorization
export interface Theme {
  id: string;
  title: string;
  description: string;
  count: number;          // Number of testimonials with this theme
  isNew: boolean;         // Show in "New Themes" section
  isEmerging: boolean;    // Show in "What's Emerging" section
}

// Submission payload (what gets sent to API)
export interface SubmitPayload {
  metadata: Metadata;
  audioBlob: Blob;
  consentGiven: boolean;
}

// API response types
export interface SubmitResponse {
  success: boolean;
  id?: string;
  error?: string;
}

// Filter types for explore queries
export interface HighlightFilters {
  keyword?: string;
  country?: string;
  careerStage?: CareerStage;
  specialty?: string;
  themeId?: string;
}

export interface MapFilters {
  careerStage?: CareerStage;
  specialty?: string;
  themeId?: string;
  language?: string;
}

// Map data point (simplified for globe plotting)
export interface MapDataPoint {
  id: string;
  coordinates: Coordinates;
  country: string;
  careerStage: CareerStage;
  highlight: string;
  metadata: Metadata;
}

// Share flow state management
export type ShareFlowStep = 'consent' | 'metadata' | 'record' | 'review';

export interface ShareFlowState {
  currentStep: ShareFlowStep;
  consentGiven: boolean;
  metadata: Partial<Metadata>;
  audioBlob: Blob | null;
  isSubmitting: boolean;
}

// Reference data types for dropdowns
export interface CountryOption {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
}

export interface LanguageOption {
  code: string;   // ISO 639-1
  name: string;
}

export interface SpecialtyOption {
  value: string;
  label: string;
}
