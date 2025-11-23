import { NextRequest, NextResponse } from 'next/server';
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export const dynamic = 'force-dynamic';

// Helper function to parse JSON with robust error handling
function parseJSON(jsonString: string): any {
  let cleaned = jsonString.trim();

  // Remove markdown code block wrappers if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  // Attempt to remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // Try to find the first and last brace to extract the main JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Malformed JSON string:", cleaned.substring(0, 500));
    throw error;
  }
}

// Initialize Claude model
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const model = new ChatAnthropic({
  modelName: "claude-sonnet-4-20250514",
  apiKey: apiKey,
  temperature: 0.3,
  maxTokens: 8000,
});

const scrapeAndParsePrompt = PromptTemplate.fromTemplate(`
You are an expert at extracting scholarship information from web pages. Analyze the provided HTML content from scholarship pages and extract structured information.

HTML Content from URLs:
{htmlContent}

Extract the following information and return it as JSON:

{{
  "name": "Full scholarship name",
  "title": "Original title if different from name",
  "description": "Detailed description of the scholarship",
  "deadline": "Deadline date in ISO format (YYYY-MM-DD) or null if not found",
  "sourceUrl": "Primary URL (first URL provided)",
  "sourceUrls": ["array", "of", "all", "urls"],
  
  // Matching fields
  "studentStatus": ["IN_COURSE", "GRADUATING", "ENTERING"], // Array of applicable statuses
  "studentType": ["DOMESTIC", "INTERNATIONAL"], // Array of applicable types
  "faculty": "Faculty name if specified",
  "fieldsOfStudy": ["Computer Science", "Engineering"], // Array of fields/majors
  "gender": "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY" | null,
  
  // Requirements
  "financialNeed": true/false,
  "academicMerit": true/false,
  "minimumGPA": 3.0 or null,
  "citizenship": "Canadian" | "US" | "International" | null,
  "residency": "Ontario" | "Province/State" | null,
  "enrollmentStatus": "Full-time" | "Part-time" | null,
  "otherRequirements": ["indigenous", "lgbtq", "rural", "first-generation"], // Array of special requirements
  
  // Amount information
  "amount": "$5,000" or "Full tuition" or null,
  "amountMin": 5000.0 or null,
  "amountMax": 10000.0 or null,
  "amountCurrency": "CAD" | "USD",
  
  // Metadata
  "tags": ["tag1", "tag2"], // Relevant tags
  "extractedText": "All relevant text extracted from pages"
}}

Important:
- Extract ALL information you can find across all provided URLs
- For dates, parse them into ISO format (YYYY-MM-DD)
- For GPA, extract numeric value (e.g., 3.5 from "3.5 GPA" or "GPA of 3.5")
- For amounts, extract both the display string and numeric min/max if range
- For arrays (studentStatus, studentType, fieldsOfStudy), include all applicable values
- Set boolean fields (financialNeed, academicMerit) based on explicit mentions or context
- If information is not found, use null for single values and empty arrays [] for arrays

Return ONLY valid JSON, no markdown formatting.
`);

const scrapeChain = RunnableSequence.from([
  scrapeAndParsePrompt,
  model,
  new StringOutputParser(),
]);

// POST - Scrape multiple URLs and extract structured data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, htmlContent } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one URL is required' },
        { status: 400 }
      );
    }

    if (!htmlContent || typeof htmlContent !== 'string') {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Validate URLs
    for (const url of urls) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: `Invalid URL format: ${url}` },
          { status: 400 }
        );
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    console.log(`Scraping ${urls.length} URL(s) and extracting scholarship data...`);

    // Use AI to extract structured data from HTML
    const resultRaw = await Promise.race([
      scrapeChain.invoke({
        htmlContent: htmlContent.substring(0, 50000), // Limit content size
      }),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000)
      )
    ]) as string;

    if (!resultRaw || resultRaw.trim().length === 0) {
      return NextResponse.json(
        { error: 'Received empty response from AI' },
        { status: 500 }
      );
    }

    const extractedData = parseJSON(resultRaw);

    // Ensure arrays are arrays and have defaults
    const parsedData = {
      ...extractedData,
      studentStatus: Array.isArray(extractedData.studentStatus) ? extractedData.studentStatus : [],
      studentType: Array.isArray(extractedData.studentType) ? extractedData.studentType : [],
      fieldsOfStudy: Array.isArray(extractedData.fieldsOfStudy) ? extractedData.fieldsOfStudy : [],
      otherRequirements: Array.isArray(extractedData.otherRequirements) ? extractedData.otherRequirements : [],
      tags: Array.isArray(extractedData.tags) ? extractedData.tags : [],
      sourceUrls: Array.isArray(extractedData.sourceUrls) ? extractedData.sourceUrls : urls,
      sourceUrl: extractedData.sourceUrl || urls[0],
    };

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('Multi-URL scraping error:', error);
    
    let errorMessage = 'Failed to scrape and parse scholarship data';
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Failed to parse extracted data. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

