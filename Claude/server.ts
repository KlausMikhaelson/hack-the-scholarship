import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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

// Helper function to format scholarship data
function formatScholarshipData(scholarshipObj: any) {
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
function formatStudentProfile(studentObj: any) {
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

// Initialize Claude model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3-pro",
  apiKey: process.env.GOOGLE_API_KEY,
});

// Define prompt templates
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

const strengthEvaluationPrompt = PromptTemplate.fromTemplate(`
Evaluate this student profile against the weighted criteria.

Student Profile:
{studentProfile}

Weighted Criteria:
{profileWeights}

Provide JSON with:
- scores: object with score, why it matters in one sentence and how the student meets this criterion in one sentence, for each criterion. The highest score must be above 30.
- totalScore: weighted total score (0-100)
- strongMatches: array of areas where student excels
- weakMatches: array of areas needing improvement
- standoutQualities: unique aspects that stand out

Return ONLY valid JSON.
`);

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
1. A compelling essay according to essay requirements that:
   - Emphasizes the student's strengths matching scholarship values
   - Uses keywords and themes from winning essays
   - Follows patterns identified in successful applications
   - Tells an authentic story 
   - Uses student's writing style and tone from their sample essay
   - Shows more and tells less

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

Do NOT use em dashes. Return ONLY valid JSON.
`);

// Create processing chains
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
  scholarshipInfo: string,
  studentProfile: string,
  essayRequirements: string = "500 words",
  sampleStudentEssay: string = "",
  winnerEssay: string = ""
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

    console.log("\nStep 4: Generating aligned essay...");
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
      scholarshipAnalysis,
      profileWeights,
      studentEvaluation,
      essay: essayOutput,
    };
  } catch (error) {
    console.error("Error in workflow:", error);
    throw error;
  }
}

// Routes

/**
 * POST /api/scholarship-essay
 * Generate a scholarship essay based on student profile and scholarship info
 * 
 * Request body:
 * {
 *   "scholarshipData": { scholarship object },
 *   "studentData": { student object },
 *   "essayRequirements": "string (optional)",
 *   "winnerEssay": "string (optional)"
 * }
 */
app.post("/api/scholarship-essay", async (req: Request, res: Response) => {
  try {
    const { scholarshipData, studentData, essayRequirements, winnerEssay } = req.body;

    // Validate required fields
    if (!scholarshipData || !studentData) {
      return res.status(400).json({
        error: "Missing required fields: scholarshipData and studentData"
      });
    }

    // Format the data
    const formattedScholarshipInfo = JSON.stringify(
      formatScholarshipData(scholarshipData),
      null,
      2
    );
    const formattedStudentProfile = JSON.stringify(
      formatStudentProfile(studentData),
      null,
      2
    );

    // Process the application
    const result = await processScholarshipApplication(
      formattedScholarshipInfo,
      formattedStudentProfile,
      essayRequirements || "500 words",
      studentData.writingSample || "",
      winnerEssay || ""
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error processing scholarship application:", error);
    res.status(500).json({
      error: "Failed to process scholarship application",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`POST /api/scholarship-essay - Generate scholarship essay`);
  console.log(`GET /api/health - Health check`);
});
