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

const scholarshipAnalysisPrompt = PromptTemplate.fromTemplate(`
Analyze this scholarship information to extract:
1. Core values and themes
2. Important keywords and phrases
3. Areas of emphasis
4. Hidden patterns in what they value
5. Organization mission and selection criteria

Scholarship Info:
{scholarshipInfo}

Provide a structured JSON analysis with:
- values: array of core values (3-5 items)
- themes: array of major themes (3-5 items)
- keywords: array of important keywords (10-15 items)
- emphasis: array of areas they emphasize (3-5 items)
- patterns: array of hidden patterns observed (3-5 items)
- organizationMission: string describing the organization's mission
- selectionCriteria: array of selection criteria mentioned
- tone: string describing the tone (formal/inspiring/personal/etc)

Return ONLY valid JSON, no markdown or explanation.
`);

const analysisChain = RunnableSequence.from([
  scholarshipAnalysisPrompt,
  model,
  new StringOutputParser(),
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scholarship } = body;

    if (!scholarship || !scholarship.description) {
      return NextResponse.json(
        { error: 'Scholarship description is required' },
        { status: 400 }
      );
    }

    // Format scholarship info
    const scholarshipInfo = JSON.stringify({
      name: scholarship.name,
      description: scholarship.description,
      deadline: scholarship.deadline,
      requirements: {
        minimumGPA: scholarship.minimumGPA,
        financialNeed: scholarship.financialNeed,
        academicMerit: scholarship.academicMerit,
        fieldsOfStudy: scholarship.fieldsOfStudy,
        studentStatus: scholarship.studentStatus,
        studentType: scholarship.studentType,
      },
    }, null, 2);

    // Analyze scholarship
    const analysisRaw = await analysisChain.invoke({
      scholarshipInfo,
    });

    const analysis = parseJSON(analysisRaw);

    // Format response to match expected structure
    const result = {
      personality: {
        extractedValues: analysis.values || [],
        priorityThemes: analysis.themes || [],
        hiddenPatterns: analysis.patterns || [],
        keywords: analysis.keywords || [],
        emphasis: analysis.emphasis || [],
        organizationMission: analysis.organizationMission || '',
        selectionCriteria: analysis.selectionCriteria || [],
        tone: analysis.tone || '',
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scholarship analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze scholarship', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

