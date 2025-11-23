export interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  gpa: string;
  major: string;
  extracurriculars: string;
  achievements: string;
  personalBackground: string;
  writingSample?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scholarship {
  id: string;
  name: string;
  description: string;
  deadline?: string;
  sourceUrl?: string;
  isPreloaded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  scholarshipId: string;
  generatedEssay: string;
  editedEssay?: string;
  explainabilityMatrix: ExplainabilityRow[];
  adaptiveWeights: WeightData[];
  scholarshipPersonality: ScholarshipPersonality;
  strengthMapping: StrengthMapping[];
  status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  scholarship?: Scholarship;
}

// Legacy types for pipeline
export interface StudentProfile {
  name: string;
  gpa: string;
  major: string;
  extracurriculars: string;
  achievements: string;
  personalBackground: string;
  writingSample?: string;
  resume?: File | null;
}

export interface ScholarshipInput {
  name: string;
  description: string;
  selectedScholarshipId?: string;
}

export interface WeightData {
  label: string;
  weight: number;
}

export interface StrengthMapping {
  scholarshipValue: string;
  studentStrength: string;
  evidence: string;
}

export interface ExplainabilityRow {
  value: string;
  weight: number;
  whyItMatters: string;
  howStudentMeetsIt: string;
}

export interface ScholarshipPersonality {
  extractedValues: string[];
  priorityThemes: string[];
  hiddenPatterns: string[];
}

export interface PipelineResult {
  scholarshipPersonality: ScholarshipPersonality;
  adaptiveWeights: WeightData[];
  strengthMapping: StrengthMapping[];
  tailoredEssay: string;
  explainability: ExplainabilityRow[];
  originalSample?: string;
}

export interface OnboardingFormData {
  // Step 1
  name: string;
  email: string;
  gpa: string;
  major: string;
  // Step 2
  extracurriculars: string;
  achievements: string;
  // Step 3
  personalBackground: string;
  // Step 4
  writingSample?: string;
}
