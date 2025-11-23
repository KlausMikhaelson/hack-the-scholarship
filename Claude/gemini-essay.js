import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// Helper function to parse JSON that might be wrapped in markdown code blocks
function parseJSON(jsonString) {
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

// Helper function to process prompts with Gemini
async function processWithGemini(prompt, input) {
  try {
    const formattedPrompt = await formatPrompt(prompt, input);
    const result = await model.generateContent(formattedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in processWithGemini:", error);
    throw error;
  }
}

// Format prompt with input variables
async function formatPrompt(template, input) {
  let prompt = template;
  for (const [key, value] of Object.entries(input)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), JSON.stringify(value, null, 2));
  }
  return prompt;
}

// Define prompt templates
const scholarshipAnalysisPrompt = `
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

Return ONLY valid JSON, no markdown.`;

const profileWeightsPrompt = `
Based on this scholarship analysis, create a weighted scoring system for student profiles. 

Scholarship Analysis:
{scholarshipAnalysis}

Generate a JSON object with:
- criteria: array of evaluation criteria with weights
- strengthCategories: categories of strengths that matter (academic, leadership, service, etc.)
- scoringRubric: how to evaluate each criterion (0-10 scale)

 Return ONLY valid JSON.`;

const strengthEvaluationPrompt = `
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

Return ONLY valid JSON.`;

const essayGenerationPrompt = `
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

Do NOT use em dashes. Return ONLY valid JSON.`;

// Create chain functions
async function analysisChain(input) {
  return processWithGemini(scholarshipAnalysisPrompt, input);
}

async function weightsChain(input) {
  return processWithGemini(profileWeightsPrompt, input);
}

async function evaluationChain(input) {
  return processWithGemini(strengthEvaluationPrompt, input);
}

async function essayChain(input) {
  return processWithGemini(essayGenerationPrompt, input);
}

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
    const scholarshipAnalysisRaw = await analysisChain({
      scholarshipInfo,
      winnerEssay,
    });
    const scholarshipAnalysis = parseJSON(scholarshipAnalysisRaw);
    console.log("✓ Analysis complete");

    console.log("\nStep 2: Generating profile weights...");
    const profileWeightsRaw = await weightsChain({
      scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
    });
    const profileWeights = parseJSON(profileWeightsRaw);
    console.log("✓ Weights generated");

    console.log("\nStep 3: Evaluating student strengths...");
    const studentEvaluationRaw = await evaluationChain({
      studentProfile,
      profileWeights: JSON.stringify(profileWeights),
    });
    const studentEvaluation = parseJSON(studentEvaluationRaw);
    console.log("✓ Evaluation complete");
    console.log(`Total Score: ${studentEvaluation.totalScore}/100`);

    console.log("\nStep 4: Generating aligned essay...");
    const essayOutputRaw = await essayChain({
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

// Example usage
async function main() {
  try {
    // Example data - replace with actual data
    const scholarshipInfo = {
      title: "Academic Excellence Scholarship",
      description: "Awarded to students demonstrating exceptional academic achievement and leadership potential.",
      requirements: {
        minimumGPA: 3.5,
        academicMerit: true,
        financialNeed: false
      }
    };

    const studentProfile = {
      name: "John Doe",
      gpa: 3.8,
      major: "Computer Science",
      extracurriculars: ["Robotics Club President", "Volunteer Tutor"],
      achievements: ["Dean's List 4 semesters", "Hackathon Winner"],
      personalBackground: "First-generation college student passionate about AI and education.",
      writingSample: ""
    };

    console.log("Starting scholarship essay generation...");
    const result = await processScholarshipApplication(
      JSON.stringify(formatScholarshipData(scholarshipInfo), null, 2),
      JSON.stringify(formatStudentProfile(studentProfile), null, 2),
      "50 words"
    );

    console.log("\nFinal Essay:");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Run the example
main().catch(console.error);
