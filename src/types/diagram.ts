/**
 * Core types for the Science Diagram Maker.
 * Structured to keep validation, generation, and UI state clean and type-safe.
 */

export interface ConceptDefinition {
  id: number;
  name: string;
  subject: 'Maths' | 'Physics' | 'Biology' | 'Chemistry';
  promptText: string;
  summary?: string;
}

export interface CheckItem {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details?: string;
}

export interface ValidationSummary {
  allPassed: boolean;
  checks: CheckItem[];
  failureReasons: string[];
}

export interface DiagramResult {
  conceptId: number;
  conceptName: string;
  subject: string;
  promptText: string;
  svg: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  retries: number;
  checks: CheckItem[];
  allChecksPassed: boolean;
  generatedAt: string;
  initialValidationFailed?: boolean;
  retryReason?: string;
}

export interface ReviewState {
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  updatedAt?: string;
}
