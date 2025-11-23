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

const patternMiningPrompt = PromptTemplate.fromTemplate(`
Analyze these {essayCount} scholarship winner essays to identify common patterns, themes, and success factors.

Winner Essays:
{winnerEssays}

Provide a comprehensive JSON analysis with:
- commonThemes: array of themes that appear across multiple essays (3-5 items)
- messagingPatterns: array of messaging strategies used (3-5 items)
- storyStructures: array of narrative structures observed (e.g., "challenge-overcome-growth", "impact-focused", "personal journey")
- successFactors: array of what winners emphasize (3-5 items)
- keywords: array of frequently used keywords/phrases (10-15 items)
- scholarshipTypePatterns: object mapping scholarship types to patterns:
  - merit: patterns common in merit-based essays
  - service: patterns common in service-based essays
  - leadership: patterns common in leadership essays
  - innovation: patterns common in innovation essays
- narrativeTechniques: array of storytelling techniques used (e.g., "specific examples", "quantifiable impact", "personal anecdotes")
- tonePatterns: array of tone characteristics (e.g., "humble confidence", "gratitude-focused", "future-oriented")

Return ONLY valid JSON.
`);

const patternChain = RunnableSequence.from([
  patternMiningPrompt,
  model,
  new StringOutputParser(),
]);

// POST - Analyze winner essays and extract patterns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { winnerEssays } = body;

    if (!winnerEssays || !Array.isArray(winnerEssays) || winnerEssays.length === 0) {
      return NextResponse.json(
        { error: 'Winner essays array is required' },
        { status: 400 }
      );
    }

    if (winnerEssays.length < 5) {
      return NextResponse.json(
        { error: 'At least 5 winner essays are recommended for pattern mining' },
        { status: 400 }
      );
    }

    // Format essays for analysis
    const essaysText = winnerEssays.map((essay: string, index: number) => 
      `Essay ${index + 1}:\n${essay}`
    ).join('\n\n---\n\n');

    // Mine patterns
    const patternsRaw = await patternChain.invoke({
      essayCount: winnerEssays.length.toString(),
      winnerEssays: essaysText,
    });

    const patterns = parseJSON(patternsRaw);

    return NextResponse.json({
      patterns,
      essaysAnalyzed: winnerEssays.length,
    });
  } catch (error) {
    console.error('Pattern mining error:', error);
    return NextResponse.json(
      { error: 'Failed to mine patterns', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

