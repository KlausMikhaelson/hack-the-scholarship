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
    // If not JSON, return as plain text
    return { improvedText: cleaned };
  }
}

// Initialize Claude model
const model = new ChatAnthropic({
  modelName: "claude-sonnet-4-20250514",
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const improvePrompt = PromptTemplate.fromTemplate(`
You are an expert writing assistant helping improve a scholarship essay.

Original text to improve:
{selectedText}

Improvement mode: {mode}

Improvement instructions:
- clearer: Make the text clearer, more direct, and easier to understand. Remove unnecessary complexity while maintaining meaning.
- emotional: Make the text more emotional and personal. Add emotional depth, personal connection, and heartfelt expression.
- academic: Make the text more formal and academic. Use sophisticated vocabulary and formal tone appropriate for scholarship applications.
- simpler: Simplify the language. Use shorter sentences, simpler words, and clearer structure while keeping the same meaning.

Requirements:
1. Keep the same core meaning and message
2. Maintain the same length (approximately the same word count)
3. Make the improvement natural and seamless
4. Return ONLY the improved text, no explanations or markdown formatting
5. Do not add quotes around the text

Return the improved text directly.
`);

const improveChain = RunnableSequence.from([
  improvePrompt,
  model,
  new StringOutputParser(),
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedText, mode } = body;

    if (!selectedText || !selectedText.trim()) {
      return NextResponse.json(
        { error: 'Selected text is required' },
        { status: 400 }
      );
    }

    if (!mode || !['clearer', 'emotional', 'academic', 'simpler'].includes(mode)) {
      return NextResponse.json(
        { error: 'Valid improvement mode is required (clearer, emotional, academic, or simpler)' },
        { status: 400 }
      );
    }

    // Improve the text using Claude
    const improvedTextRaw = await improveChain.invoke({
      selectedText: selectedText.trim(),
      mode,
    });

    // Clean up the response (remove any markdown formatting or quotes)
    let improvedText = improvedTextRaw.trim();
    
    // Remove markdown code blocks if present
    if (improvedText.startsWith('```')) {
      improvedText = improvedText.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    }
    
    // Remove quotes if the entire text is wrapped in them
    if ((improvedText.startsWith('"') && improvedText.endsWith('"')) ||
        (improvedText.startsWith("'") && improvedText.endsWith("'"))) {
      improvedText = improvedText.slice(1, -1);
    }

    return NextResponse.json({
      improvedText: improvedText.trim(),
      originalText: selectedText,
      mode,
    });
  } catch (error) {
    console.error('Text improvement error:', error);
    return NextResponse.json(
      { error: 'Failed to improve text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

