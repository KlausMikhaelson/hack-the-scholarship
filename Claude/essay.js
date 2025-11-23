import dotenv from "dotenv";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Load environment variables from .env file
dotenv.config();

// Helper function to parse JSON that might be wrapped in markdown code blocks
function parseJSON(jsonString) {
  // Remove markdown code block formatting if present
  let cleaned = jsonString.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(cleaned);
}

// Helper function to format scholarship data, keeping only relevant fields
function formatScholarshipData(scholarshipObj) {
  return {
    title: scholarshipObj.title,
    description: scholarshipObj.description,
    studentStatus: scholarshipObj.studentStatus,
    studentType: scholarshipObj.studentType,
    faculty: scholarshipObj.faculty,
    fieldsOfStudy: scholarshipObj.fieldsOfStudy,
    requirements: {
      financialNeed: scholarshipObj.requirements?.financialNeed,
      academicMerit: scholarshipObj.requirements?.academicMerit,
      minimumGPA: scholarshipObj.requirements?.minimumGPA,
      enrollmentStatus: scholarshipObj.requirements?.enrollmentStatus,
      other: scholarshipObj.requirements?.other
    }
  };
}

// Helper function to format student profile data
function formatStudentProfile(studentObj) {
  return {
    name: studentObj.name,
    gpa: studentObj.gpa,
    major: studentObj.major,
    extracurriculars: studentObj.extracurriculars,
    achievements: studentObj.achievements,
    personalBackground: studentObj.personalBackground,
    writingSample: studentObj.writingSample || ""
  };
}

// Initialize Claude
const model = new ChatAnthropic({
  modelName: "claude-sonnet-4-20250514",
  anthropicApiKey: process.env.CLAUDE_API_KEY,
});

// Step 1: Analyze Scholarship for Values & Patterns
const scholarshipAnalysisPrompt = PromptTemplate.fromTemplate(`
Analyze this scholarship information and winner essay (if provided) to extract:
1. Core values and themes
2. Important keywords and phrases
3. Areas of emphasis
4. Hidden patterns in what they value

Scholarship Info:
{scholarshipInfo}

Winner Essay (if available):
{winnerEssay}

Provide a structured JSON analysis with:
- values: array of core values
- themes: array of major themes
- keywords: array of important keywords
- emphasis: array of areas they emphasize
- patterns: array of hidden patterns observed
- weights: object mapping each value/theme to importance (0-10)

Return ONLY valid JSON, no markdown or explanation.
`);

// Step 2: Generate Student Profile Weights
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

// Step 5: Generate Aligned Essay
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
   - Uses keywords and themes from winning essays
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

// Main workflow function
async function processScholarshipApplication(
  scholarshipInfo,
  studentProfile,
  essayRequirements = "500 words",
  sampleStudentEssay = "",
  winnerEssay = ""
) {
  try {
    console.log("Step 1: Analyzing scholarship...");
    const scholarshipAnalysisRaw = await analysisChain.invoke({
      scholarshipInfo,
      winnerEssay,
    });
    const scholarshipAnalysis = parseJSON(scholarshipAnalysisRaw);
    console.log("✓ Analysis complete");

    console.log("\nStep 2: Generating profile weights...");
    const profileWeightsRaw = await weightsChain.invoke({
      scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
    });
    const profileWeights = parseJSON(profileWeightsRaw);
    console.log("✓ Weights generated");

    console.log("\nStep 3: Evaluating student strengths...");
    const studentEvaluationRaw = await evaluationChain.invoke({
      studentProfile,
      profileWeights: JSON.stringify(profileWeights),
    });
    const studentEvaluation = parseJSON(studentEvaluationRaw);
    console.log("✓ Evaluation complete");
    console.log(`Total Score: ${studentEvaluation.totalScore}/100`);

    console.log("\nStep 5: Generating aligned essay...");
    const essayOutputRaw = await essayChain.invoke({
      studentProfile,
      scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
      studentEvaluation: JSON.stringify(studentEvaluation),
      essayRequirements,
      sampleStudentEssay,
    });
    const essayOutput = parseJSON(essayOutputRaw);
    console.log("✓ Essay generated");

    return {
      scholarshipAnalysis,// values 
      profileWeights, // weights
      studentEvaluation,// strength mapping
      essay: essayOutput, // essay and explanation
    };
  } catch (error) {
    console.error("Error in workflow:", error);
    throw error;
  }
}

// Example usage
async function main() {
  // Raw scholarship data from your source
  const rawScholarshipData = {
    title: "Andrew Bretz Memorial Scholarship I",
    description: "Awarded to Victoria College students who have achieved overall A standing and are pursuing studies in Drama or English or Renaissance Studies. Victoria College In-course Domestic;International Academic Merit, Other up to $1,000",
    studentStatus: "in-course",
    studentType: "domestic",
    faculty: null,
    fieldsOfStudy: ["English"],
    requirements: {
      financialNeed: false,
      academicMerit: true,
      minimumGPA: null,
      enrollmentStatus: null,
      other: []
    }
  };

  // Format the scholarship data to keep only relevant fields
  const scholarshipInfo = JSON.stringify(formatScholarshipData(rawScholarshipData), null, 2);


  const winnerEssay = `
    Growing up in a low-income neighborhood, I witnessed firsthand how lack of 
    resources created barriers to education. Instead of accepting this reality, 
    I founded a free tutor program that has served over 200 students. Through 
    this experience, I learned that true leadership means empowering others...
  `;

  // Raw student profile data from your form
  const rawStudentData = {
    name: "Maria Rodriguez",
    gpa: 3.9,
    major: "Computer Science",
    extracurriculars: "President of Student Council, Volunteer at local food bank (300+ hours), Founded coding club for underrepresented students, Part-time job to support family (20 hrs/week)",
    achievements: "National Honor Society, Regional science fair winner, First-generation college student",
    personalBackground: "Growing up in a low-income neighborhood, I witnessed firsthand how lack of resources created barriers to education. My journey has been shaped by perseverance, community service, and a commitment to lifting others up as I rise."
  };

  // Format the student profile data
  const studentProfile = JSON.stringify(formatStudentProfile(rawStudentData), null, 2);

  const sampleStudentEssay = `
    I have always believed that education is the most powerful tool for change. 
    As a first-generation college student from a low-income background, I understand 
    the barriers that many students face. My journey has been shaped by perseverance, 
    community service, and a commitment to lifting others up as I rise.
  `;

  const result = await processScholarshipApplication(
    scholarshipInfo,
    studentProfile,
    "50 words",
    sampleStudentEssay,
    winnerEssay
  );

  console.log("\n========== RESULTS ==========");
  console.log("\n--- Scholarship Analysis ---");
  console.log(JSON.stringify(result.scholarshipAnalysis, null, 2));
  console.log("\n--- Student Score ---");
  console.log(`Total: ${result.studentEvaluation.totalScore}/100`);
  console.log("Strong Matches:", result.studentEvaluation.strongMatches);

  console.log("\n--- Generated Essay ---");
  console.log(result.essay.essay);
  console.log(`\nWord Count: ${result.essay.wordCount}`);

  console.log("\n--- Strategic Explanation ---");
  console.log(result.essay.explanation);
}

// Run the example
main().catch(console.error);