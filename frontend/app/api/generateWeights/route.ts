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

const adaptiveWeightsPrompt = PromptTemplate.fromTemplate(`
Based on this scholarship analysis, create an adaptive weight profile that shows what matters most for this specific scholarship type.

Scholarship Analysis:
{scholarshipAnalysis}

Generate a JSON object with:
- weights: array of objects with {label: string, weight: number} where weights sum to 1.0
- scholarshipType: string identifying the type (merit/service/leadership/innovation/etc)
- explanation: string explaining why these weights were chosen (2-3 sentences)

The weights should differ dramatically based on scholarship type:
- Merit scholarships: Higher weight on Academic Achievement (40-50%)
- Service scholarships: Higher weight on Community Service (40-50%)
- Leadership scholarships: Higher weight on Leadership (40-50%)
- Innovation scholarships: Higher weight on Innovation/Creativity (40-50%)
- Need-based scholarships: Higher weight on Financial Need/Background (40-50%)

Ensure weights sum to exactly 1.0 and are explainable.

Return ONLY valid JSON.
`);

const weightsChain = RunnableSequence.from([
  adaptiveWeightsPrompt,
  model,
  new StringOutputParser(),
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scholarshipAnalysis } = body;

    if (!scholarshipAnalysis) {
      return NextResponse.json(
        { error: 'Scholarship analysis is required' },
        { status: 400 }
      );
    }

    // Generate adaptive weights
    const weightsRaw = await weightsChain.invoke({
      scholarshipAnalysis: typeof scholarshipAnalysis === 'string' 
        ? scholarshipAnalysis 
        : JSON.stringify(scholarshipAnalysis),
    });

    const weightsData = parseJSON(weightsRaw);

    // Format response
    const result = {
      weights: weightsData.weights || [],
      scholarshipType: weightsData.scholarshipType || 'general',
      explanation: weightsData.explanation || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Weight generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
