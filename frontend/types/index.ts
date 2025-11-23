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

export interface Scholarship {
  id: string;
  name: string;
  description: string;
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

