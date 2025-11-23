import { NextRequest, NextResponse } from 'next/server';
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Helper function to parse JSON
function parseJSON(jsonString: string): any {
  let cleaned = jsonString.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parse error:", error);
    throw error;
  }
}

// Initialize Claude model
const model = new ChatAnthropic({
  modelName: "claude-sonnet-4-20250514",
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const explainabilityPrompt = PromptTemplate.fromTemplate(`
Generate detailed explainability for each weighted criterion in this scholarship application.

Student Profile:
{studentProfile}

Scholarship Analysis:
{scholarshipAnalysis}

Adaptive Weights:
{weights}

Generated Essay:
{essay}

For each weighted criterion, provide:
- value: the criterion name
- weight: the weight percentage
- whyItMatters: explanation of why this criterion matters for THIS specific scholarship type (2-3 sentences)
- howStudentMeetsIt: specific evidence from student profile showing how they meet this criterion (2-3 sentences)
- essayIntegration: explanation of how this criterion was integrated into the essay
- strategicChoice: explanation of why this angle was chosen over alternatives

Return JSON with:
- explainability: array of explainability objects for each weight
- overallStrategy: explanation of the overall strategic approach
- keyDecisions: array of key strategic decisions made

Return ONLY valid JSON.
`);

const explainabilityChain = RunnableSequence.from([
  explainabilityPrompt,
  model,
  new StringOutputParser(),
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student, scholarship, weights, essay, scholarshipAnalysis } = body;

    if (!student || !scholarship || !weights || !essay) {
      return NextResponse.json(
        { error: 'Student, scholarship, weights, and essay are required' },
        { status: 400 }
      );
    }

    // Generate explainability
    const explainabilityRaw = await explainabilityChain.invoke({
      studentProfile: typeof student === 'string' ? student : JSON.stringify(student, null, 2),
      scholarshipAnalysis: typeof scholarshipAnalysis === 'string' 
        ? scholarshipAnalysis 
        : JSON.stringify(scholarshipAnalysis || scholarship, null, 2),
      weights: typeof weights === 'string' ? weights : JSON.stringify(weights, null, 2),
      essay: typeof essay === 'string' ? essay : essay,
    });

    const explainabilityData = parseJSON(explainabilityRaw);

    return NextResponse.json({
      explainability: explainabilityData.explainability || [],
      overallStrategy: explainabilityData.overallStrategy || '',
      keyDecisions: explainabilityData.keyDecisions || [],
    });
  } catch (error) {
    console.error('Explainability generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explainability', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
