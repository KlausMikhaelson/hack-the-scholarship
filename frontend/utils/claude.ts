import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Helper function to parse JSON that might be wrapped in markdown code blocks
function parseJSON(jsonString: string) {
  let cleaned = jsonString.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(cleaned);
}

// Initialize Claude model
const getModel = () => {
  return new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};

// Step 1: Analyze Scholarship
const scholarshipAnalysisPrompt = PromptTemplate.fromTemplate(`
Analyze this scholarship information to extract:
1. Core values and themes
2. Important keywords and phrases
3. Areas of emphasis
4. Hidden patterns in what they value

Scholarship Info:
{scholarshipInfo}

Provide a structured JSON analysis with:
- values: array of core values
- themes: array of major themes  
- keywords: array of important keywords
- emphasis: array of areas they emphasize
- patterns: array of hidden patterns observed
- weights: object mapping each value/theme to importance (0-10)

Return ONLY valid JSON, no markdown or explanation.
`);

// Step 2: Generate Profile Weights
const profileWeightsPrompt = PromptTemplate.fromTemplate(`
Based on this scholarship analysis, create a weighted scoring system for student profiles.

Scholarship Analysis:
{scholarshipAnalysis}

Generate a JSON object with:
- criteria: array of evaluation criteria with weights
- strengthCategories: categories of strengths that matter (academic, leadership, service, etc.)
- scoringRubric: how to evaluate each criterion (0-10 scale)

Return ONLY valid JSON.
`);

// Step 3: Evaluate Student Strengths
const strengthEvaluationPrompt = PromptTemplate.fromTemplate(`
Evaluate this student profile against the weighted criteria.

Student Profile:
{studentProfile}

Weighted Criteria:
{profileWeights}

Provide JSON with:
- scores: object with score for each criterion
- totalScore: weighted total score (0-100)
- strongMatches: array of areas where student excels
- weakMatches: array of areas needing improvement
- standoutQualities: unique aspects that stand out

Return ONLY valid JSON.
`);

// Step 4: Generate Essay
const essayGenerationPrompt = PromptTemplate.fromTemplate(`
Write a scholarship essay for this student that aligns with the weighted criteria.

Student Profile:
{studentProfile}

Scholarship Analysis:
{scholarshipAnalysis}

Student Strengths:
{studentEvaluation}

Essay Requirements:
{essayRequirements}

Sample Student Essay:
{sampleStudentEssay}

Generate:
1. A compelling essay (500-750 words) that:
   - Emphasizes the student's strengths matching scholarship values
   - Uses keywords and themes naturally
   - Follows patterns identified in successful applications
   - Tells an authentic story

2. A detailed explanation of strategic choices:
   - Which values were emphasized and why
   - How keywords were naturally integrated
   - Which patterns were followed
   - How weights influenced structure

Return JSON with:
- essay: the complete essay text
- wordCount: number of words
- explanation: detailed strategic explanation
- valueAlignment: how essay maps to each weighted value
- keywordUsage: list of strategic keywords used

Return ONLY valid JSON.
`);

export async function processScholarshipApplication(
  scholarshipDescription: string,
  studentProfile: any,
  essayRequirements: string = "500-750 words",
  winnerEssay: string = ""
) {
  const model = getModel();

  // Create chains
  const analysisChain = RunnableSequence.from([
    scholarshipAnalysisPrompt,
    model,
    new StringOutputParser(),
  ]);

  const weightsChain = RunnableSequence.from([
    profileWeightsPrompt,
    model,
    new StringOutputParser(),
  ]);

  const evaluationChain = RunnableSequence.from([
    strengthEvaluationPrompt,
    model,
    new StringOutputParser(),
  ]);

  const essayChain = RunnableSequence.from([
    essayGenerationPrompt,
    model,
    new StringOutputParser(),
  ]);

  // Step 1: Analyze scholarship
  console.log("Step 1: Analyzing scholarship...");
  const scholarshipAnalysisRaw = await analysisChain.invoke({
    scholarshipInfo: scholarshipDescription,
    winnerEssay,
  });
  const scholarshipAnalysis = parseJSON(scholarshipAnalysisRaw);

  // Step 2: Generate profile weights
  console.log("Step 2: Generating profile weights...");
  const profileWeightsRaw = await weightsChain.invoke({
    scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
  });
  const profileWeights = parseJSON(profileWeightsRaw);

  // Step 3: Evaluate student
  console.log("Step 3: Evaluating student strengths...");
  const studentEvaluationRaw = await evaluationChain.invoke({
    studentProfile: JSON.stringify(studentProfile),
    profileWeights: JSON.stringify(profileWeights),
  });
  const studentEvaluation = parseJSON(studentEvaluationRaw);

  // Step 4: Generate essay
  console.log("Step 4: Generating aligned essay...");
  const essayOutputRaw = await essayChain.invoke({
    studentProfile: JSON.stringify(studentProfile),
    scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
    studentEvaluation: JSON.stringify(studentEvaluation),
    essayRequirements,
    sampleStudentEssay: studentProfile.writingSample || "",
  });
  const essayOutput = parseJSON(essayOutputRaw);

  return {
    scholarshipAnalysis,
    profileWeights,
    studentEvaluation,
    essay: essayOutput,
  };
}

function transformClaudeResponse(claudeResult: any, profile: any) {
  const analysis = claudeResult.scholarshipAnalysis;
  const weights = claudeResult.profileWeights;
  const evaluation = claudeResult.studentEvaluation;
  const essay = claudeResult.essay;

  // Convert weights to array format
  const adaptiveWeightsArray = weights.criteria?.map((c: any) => ({
    label: c.name,
    weight: c.weight / 10 // Normalize from 0-10 to 0-1
  })) || [];

  // Create strength mapping
  const strengthMapping = evaluation.strongMatches?.map((match: string, idx: number) => ({
    scholarshipValue: analysis.values[idx] || match,
    studentStrength: match,
    evidence: evaluation.standoutQualities[idx] || 'Demonstrated in profile'
  })) || [];

  // Create explainability
  const explainability = Object.entries(essay.valueAlignment || {}).map(([value, how]: [string, any]) => {
    const weight = analysis.weights[value] || 5;
    return {
      value,
      weight: weight / 10,
      whyItMatters: `This value is emphasized in the scholarship criteria`,
      howStudentMeetsIt: how
    };
  });

  return {
    scholarshipPersonality: {
      extractedValues: analysis.values || [],
      priorityThemes: analysis.themes || [],
      hiddenPatterns: analysis.patterns || []
    },
    adaptiveWeights: adaptiveWeightsArray,
    strengthMapping,
    tailoredEssay: essay.essay,
    explainability,
    originalSample: profile.writingSample || undefined
  };
}

function getMockResult(profile: any, scholarship: any) {
  return {
    scholarshipPersonality: {
      extractedValues: [
        'Innovation and Creativity',
        'Community Impact',
        'Academic Excellence',
        'Leadership Potential',
        'Diversity and Inclusion'
      ],
      priorityThemes: [
        'Technical Innovation',
        'Problem-Solving Mindset',
        'Social Responsibility',
        'Collaborative Leadership'
      ],
      hiddenPatterns: [
        'Emphasis on real-world application of skills',
        'Preference for interdisciplinary approaches',
        'Focus on sustainable and scalable solutions',
        'Value placed on mentorship and giving back'
      ]
    },
    adaptiveWeights: [
      { label: 'Academic Excellence', weight: 0.35 },
      { label: 'Leadership', weight: 0.25 },
      { label: 'Innovation', weight: 0.20 },
      { label: 'Community Service', weight: 0.15 },
      { label: 'Personal Growth', weight: 0.05 }
    ],
    strengthMapping: [
      {
        scholarshipValue: 'Leadership',
        studentStrength: profile.extracurriculars?.split(',')[0] || 'Leadership experience',
        evidence: 'Extracurricular activities'
      },
      {
        scholarshipValue: 'Innovation',
        studentStrength: profile.achievements?.split(',')[0] || 'Creative problem-solving',
        evidence: 'Achievements section'
      },
      {
        scholarshipValue: 'Academic Excellence',
        studentStrength: `${profile.gpa} GPA in ${profile.major}`,
        evidence: 'Strong academic record'
      },
      {
        scholarshipValue: 'Community Impact',
        studentStrength: 'Volunteer work',
        evidence: 'Personal background'
      },
      {
        scholarshipValue: 'Personal Growth',
        studentStrength: 'First-generation student',
        evidence: 'Personal background'
      }
    ],
    tailoredEssay: generateMockEssay(profile, scholarship),
    explainability: [
      {
        value: 'Academic Excellence',
        weight: 0.35,
        whyItMatters: 'Strong academic performance demonstrates dedication and potential.',
        howStudentMeetsIt: `${profile.name} maintains a ${profile.gpa} GPA in ${profile.major}.`
      },
      {
        value: 'Leadership',
        weight: 0.25,
        whyItMatters: 'Leadership creates positive change and inspires others.',
        howStudentMeetsIt: 'Demonstrated through extracurricular leadership roles.'
      },
      {
        value: 'Innovation',
        weight: 0.20,
        whyItMatters: 'Creative problem-solving is essential for future success.',
        howStudentMeetsIt: 'Achievements showcase technical innovation.'
      },
      {
        value: 'Community Service',
        weight: 0.15,
        whyItMatters: 'Service reflects empathy and social responsibility.',
        howStudentMeetsIt: 'Active volunteer work serving others.'
      },
      {
        value: 'Personal Growth',
        weight: 0.05,
        whyItMatters: 'Resilience indicates strong character.',
        howStudentMeetsIt: 'First-generation student showing determination.'
      }
    ],
    originalSample: profile.writingSample || undefined
  };
}

function generateMockEssay(profile: any, scholarship: any): string {
  return `As a ${profile.major} student with a ${profile.gpa} GPA, I am deeply passionate about leveraging my skills to create meaningful impact in my community and beyond. The ${scholarship.name} aligns perfectly with my values and aspirations.

Throughout my academic journey, I have consistently demonstrated excellence not just in the classroom, but in applying my knowledge to real-world challenges. My work as ${profile.extracurriculars?.split(',')[0] || 'a dedicated student'} exemplifies my commitment to innovation and pushing boundaries.

Leadership has been a cornerstone of my personal development. Through my volunteer work, I have learned the importance of collaboration, empathy, and inspiring others to work toward common goals.

${profile.personalBackground}

I am particularly drawn to the ${scholarship.name} because it recognizes the importance of holistic excellence—balancing academic achievement with community service, leadership, and personal growth. This scholarship would enable me to continue my education while expanding my capacity to serve others.

Looking forward, I am committed to using my education to create innovative solutions that benefit society, mentor future students, and give back to communities that have supported me. Thank you for considering my application.`;
}

