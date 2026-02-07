/**
 * API Layer - Mock implementation ready for AWS migration
 * 
 * This module provides a clean interface between UI components and data sources.
 * Currently uses mock data, but is structured to swap to AWS API Gateway endpoints
 * by simply changing the function implementations.
 * 
 * Future AWS integration:
 * - submitTestimonial: POST to API Gateway → Lambda → S3 (audio) + RDS (metadata)
 * - getHighlights: GET from API Gateway → Lambda → RDS
 * - getMapData: GET from API Gateway → Lambda → RDS
 * - getThemes: GET from API Gateway → Lambda → RDS
 */

import type {
  SubmitPayload,
  SubmitResponse,
  Testimonial,
  Theme,
  MapDataPoint,
  HighlightFilters,
  MapFilters,
} from './types';
import { mockTestimonials, mockThemes } from './mockData';

// Environment variable for API base URL
// Set to AWS API Gateway URL in production
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Simulate network delay for realistic UX testing
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Submit a new testimonial
 * 
 * Current: Stores in memory and returns mock ID
 * Future: POST metadata to API Gateway, upload audio to S3 via presigned URL
 */
export async function submitTestimonial(payload: SubmitPayload): Promise<SubmitResponse> {
  await simulateDelay(1000); // Simulate upload time
  
  // Validate required fields
  if (!payload.consentGiven) {
    return { success: false, error: 'Consent is required' };
  }
  
  if (!payload.audioBlob) {
    return { success: false, error: 'Audio recording is required' };
  }
  
  if (!payload.metadata.country || !payload.metadata.careerStage) {
    return { success: false, error: 'Required metadata fields are missing' };
  }
  
  // Mock successful submission
  const newId = `testimonial-${Date.now()}`;
  
  console.log('[API] Testimonial submitted:', {
    id: newId,
    metadata: payload.metadata,
    audioSize: payload.audioBlob.size,
  });
  
  /* 
   * Future AWS implementation:
   * 
   * // 1. Get presigned URL for S3 upload
   * const { uploadUrl, audioKey } = await fetch(`${API_BASE}/upload-url`, {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ contentType: payload.audioBlob.type }),
   * }).then(res => res.json());
   * 
   * // 2. Upload audio to S3
   * await fetch(uploadUrl, {
   *   method: 'PUT',
   *   body: payload.audioBlob,
   *   headers: { 'Content-Type': payload.audioBlob.type },
   * });
   * 
   * // 3. Submit metadata to API Gateway
   * const response = await fetch(`${API_BASE}/testimonials`, {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     ...payload.metadata,
   *     audioKey,
   *     consentGiven: payload.consentGiven,
   *   }),
   * });
   * 
   * return response.json();
   */
  
  return { success: true, id: newId };
}

/**
 * Get testimonial highlights with optional filtering
 * 
 * Current: Filters mock data in memory
 * Future: GET from API Gateway with query parameters
 */
export async function getHighlights(filters?: HighlightFilters): Promise<Testimonial[]> {
  await simulateDelay();
  
  let results = [...mockTestimonials];
  
  if (filters) {
    // Keyword search in highlights
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      results = results.filter(t => 
        t.highlight.toLowerCase().includes(keyword)
      );
    }
    
    // Filter by country
    if (filters.country) {
      results = results.filter(t => t.metadata.country === filters.country);
    }
    
    // Filter by career stage
    if (filters.careerStage) {
      results = results.filter(t => t.metadata.careerStage === filters.careerStage);
    }
    
    // Filter by specialty
    if (filters.specialty) {
      results = results.filter(t => t.metadata.specialty === filters.specialty);
    }
    
    // Filter by theme
    if (filters.themeId) {
      results = results.filter(t => 
        t.themeIds?.includes(filters.themeId!)
      );
    }
  }
  
  // Sort by most recent first
  results.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  
  /* 
   * Future AWS implementation:
   * 
   * const params = new URLSearchParams();
   * if (filters?.keyword) params.set('keyword', filters.keyword);
   * if (filters?.country) params.set('country', filters.country);
   * if (filters?.careerStage) params.set('careerStage', filters.careerStage);
   * if (filters?.specialty) params.set('specialty', filters.specialty);
   * if (filters?.themeId) params.set('themeId', filters.themeId);
   * 
   * const response = await fetch(`${API_BASE}/highlights?${params}`);
   * return response.json();
   */
  
  return results;
}

/**
 * Get map data points for globe visualization
 * 
 * Current: Transforms mock testimonials to map points
 * Future: GET from API Gateway with query parameters
 */
export async function getMapData(filters?: MapFilters): Promise<MapDataPoint[]> {
  await simulateDelay();
  
  let testimonials = [...mockTestimonials];
  
  if (filters) {
    if (filters.careerStage) {
      testimonials = testimonials.filter(t => 
        t.metadata.careerStage === filters.careerStage
      );
    }
    
    if (filters.specialty) {
      testimonials = testimonials.filter(t => 
        t.metadata.specialty === filters.specialty
      );
    }
    
    if (filters.themeId) {
      testimonials = testimonials.filter(t => 
        t.themeIds?.includes(filters.themeId!)
      );
    }
    
    if (filters.language) {
      testimonials = testimonials.filter(t => 
        t.metadata.language === filters.language
      );
    }
  }
  
  // Transform to map data points
  const mapPoints: MapDataPoint[] = testimonials.map(t => ({
    id: t.id,
    coordinates: t.coordinates,
    country: t.metadata.country,
    careerStage: t.metadata.careerStage,
    highlight: t.highlight,
    metadata: t.metadata,
  }));
  
  /* 
   * Future AWS implementation:
   * 
   * const params = new URLSearchParams();
   * if (filters?.careerStage) params.set('careerStage', filters.careerStage);
   * if (filters?.specialty) params.set('specialty', filters.specialty);
   * if (filters?.themeId) params.set('themeId', filters.themeId);
   * if (filters?.language) params.set('language', filters.language);
   * 
   * const response = await fetch(`${API_BASE}/map-data?${params}`);
   * return response.json();
   */
  
  return mapPoints;
}

/**
 * Get themes for categorization
 * 
 * Current: Returns mock themes
 * Future: GET from API Gateway
 */
export async function getThemes(): Promise<Theme[]> {
  await simulateDelay(300);
  
  /* 
   * Future AWS implementation:
   * 
   * const response = await fetch(`${API_BASE}/themes`);
   * return response.json();
   */
  
  return mockThemes;
}

/**
 * Get a single testimonial by ID
 * 
 * Current: Finds in mock data
 * Future: GET from API Gateway
 */
export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  await simulateDelay(200);
  
  const testimonial = mockTestimonials.find(t => t.id === id);
  
  /* 
   * Future AWS implementation:
   * 
   * const response = await fetch(`${API_BASE}/testimonials/${id}`);
   * if (!response.ok) return null;
   * return response.json();
   */
  
  return testimonial || null;
}
