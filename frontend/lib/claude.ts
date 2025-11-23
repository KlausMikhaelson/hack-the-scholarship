import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Helper function to parse JSON that might be wrapped in markdown code blocks
function parseJSON(jsonString: string): any {
  let cleaned = jsonString.trim();
  
  // Remove markdown code blocks
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  
  // Try to find JSON object boundaries if there's extra text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parse error at position:", (error as any).message);
    console.error("Raw string (first 2000 chars):", cleaned.substring(0, 2000));
    
    // Try a more robust approach: use a streaming JSON parser or manual extraction
    try {
      // Extract essay field manually if it exists
      const essayMatch = cleaned.match(/"essay"\s*:\s*"((?:[^"\\]|\\.|\\n)*)"/);
      const wordCountMatch = cleaned.match(/"wordCount"\s*:\s*(\d+)/);
      const explanationMatch = cleaned.match(/"explanation"\s*:\s*(\{[\s\S]*?\})/);
      
      if (essayMatch) {
        const essay = essayMatch[1]
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\');
        
        const result: any = {
          essay: essay,
          wordCount: wordCountMatch ? parseInt(wordCountMatch[1]) : essay.split(/\s+/).length,
          explanation: {},
          valueAlignment: {},
          keywordUsage: [],
        };
        
        // Try to parse explanation if found
        if (explanationMatch) {
          try {
            result.explanation = JSON.parse(explanationMatch[1]);
          } catch (e) {
            // Ignore explanation parse errors
          }
        }
        
        console.warn("Using fallback extraction for essay field");
        return result;
      }
    } catch (fallbackError) {
      console.error("Fallback extraction also failed:", fallbackError);
    }
    
    throw error;
  }
}

// Initialize Claude model
const model = new ChatAnthropic({
  modelName: "claude-sonnet-4-20250514",
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
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

// Step 4: Generate Aligned Essay
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
1. A compelling essay that:
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
- essay: the complete essay text (MUST be properly escaped JSON string - escape all quotes, newlines, etc.)
- wordCount: number of words
- explanation: detailed strategic explanation (as a JSON object)
- valueAlignment: how essay maps to each weighted value (as a JSON object)
- keywordUsage: list of strategic keywords used (as a JSON array)

CRITICAL: The essay field must be a valid JSON string. Escape all quotes with \\", escape newlines with \\n, escape backslashes with \\\\.
Return ONLY valid JSON that can be parsed by JSON.parse(). Do not include any markdown formatting.
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
export async function processScholarshipApplication(
  scholarshipInfo: string,
  studentProfile: string,
  essayRequirements: string = "500 words",
  sampleStudentEssay: string = "",
  winnerEssays: string[] = []
) {
  try {
    console.log("Step 1: Analyzing scholarship...");
    const winnerEssayText = winnerEssays.length > 0 
      ? winnerEssays.map((e, i) => `Essay ${i + 1}:\n${e}`).join('\n\n')
      : "";
    
    const scholarshipAnalysisRaw = await analysisChain.invoke({
      scholarshipInfo,
      winnerEssay: winnerEssayText,
    });
    const scholarshipAnalysis = parseJSON(scholarshipAnalysisRaw);
    console.log("✓ Analysis complete");

    console.log("\nStep 2: Generating adaptive weights...");
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

    console.log("\nStep 4: Generating tailored essay...");
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

// Export helper functions
export { parseJSON };
