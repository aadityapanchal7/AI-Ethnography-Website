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
  /** Country or region the group is primarily based in (ISO 3166-1 alpha-2) */
  country: string;
  careerStage: CareerStage;
  language: string;       // ISO 639-1 code — primary language in the recording
  practiceSetting: PracticeSetting;
  /** Optional; themes may be inferred from transcripts instead */
  specialty?: string;
  /** Browser geolocation when user opts in (sent to AWS as lat/lng on submission) */
  coordinates?: Coordinates;
  locationSource?: 'browser';
  /** This study prioritizes group dialogue (not solo individual submissions). */
  isGroupSubmission: boolean;
  /** Ages and identities of each person contributing, as the group is comfortable sharing */
  contributorIdentities?: string;
}

/** Sort order for discussion list (API query + client mock). */
export type DiscussionPostSort = 'recent' | 'upvotes' | 'title';

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

// Transcription status for voice-first discussion posts
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Comment on a discussion post (future: API + moderation)
export interface DiscussionComment {
  id: string;
  postId: string;
  body: string;
  authorLabel: string;
  createdAt: string;
}

// Discussion thread post: voice submission → transcript → LLM title/summary → thread
// Map: same submission has geolocation; map point id aligns with sourceSubmissionId when present
export interface DiscussionPost {
  id: string;
  title: string;
  /** AI / editorial short summary shown in cards and map-adjacent UI */
  summary: string;
  /** Longer excerpt or full story text derived from transcript */
  body: string;
  tags: string[];
  createdAt: string;
  upvotes: number;
  metadata: Metadata;
  audioUrl?: string;
  transcriptText?: string;
  transcriptionStatus: TranscriptionStatus;
  /** Links this post to the same logical submission as map highlights */
  sourceSubmissionId?: string;
  /** Redundant copy of submission coordinates for map handoff without a round-trip */
  coordinates?: Coordinates;
  comments: DiscussionComment[];
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
  /** Optional link back to discussion post id when this marker is voice-derived */
  discussionPostId?: string;
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
