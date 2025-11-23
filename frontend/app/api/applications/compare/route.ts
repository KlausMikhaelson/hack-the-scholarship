import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
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
    
    // Fallback: Try to extract essays array if main parsing fails
    try {
      const essaysMatch = cleaned.match(/"essays"\s*:\s*(\[[\s\S]*?\])/);
      if (essaysMatch) {
        const essaysArray = JSON.parse(essaysMatch[1].replace(/,(\s*[}\]])/g, '$1'));
        return { essays: essaysArray, comparison: {} };
      }
    } catch (e) {
      console.error("Fallback parsing also failed:", e);
    }
    
    throw error;
  }
}

// Initialize Claude model
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY or CLAUDE_API_KEY not configured');
}

const model = new ChatAnthropic({
  modelName: "claude-sonnet-4-20250514",
  apiKey: apiKey,
  temperature: 0.7,
  maxTokens: 8000, // Increased for longer essays
});

const comparativeEssayPrompt = PromptTemplate.fromTemplate(`
Take ONE student profile and generate 3 different essays for 3 different scholarship types, showing how the same story is reframed for different audiences.

Student Profile:
{studentProfile}

Scholarship Types to Generate:
1. Merit Scholarship - Emphasize academic achievement, GPA, test scores, academic projects
2. Service Scholarship - Emphasize volunteer work, community impact, service hours, social responsibility
3. Leadership Scholarship - Emphasize leadership roles, team management, initiative, influence

For each essay type, generate:
- essay: the complete essay text (500 words)
- angle: explanation of the angle chosen
- emphasis: what aspects of student profile were emphasized
- reframing: how the same experiences were reframed differently
- keywords: strategic keywords used for this scholarship type

Return JSON with:
- essays: array of 3 objects, each with:
  - scholarshipType: string (merit/service/leadership)
  - essay: string
  - angle: string
  - emphasis: array of strings
  - reframing: string
  - keywords: array of strings
- comparison: object explaining:
  - howSameStory: explanation of how the same story was told differently
  - keyDifferences: array of key differences between essays
  - strategicChoices: explanation of strategic reframing choices

Return ONLY valid JSON.
`);

const comparativeChain = RunnableSequence.from([
  comparativeEssayPrompt,
  model,
  new StringOutputParser(),
]);

// POST - Generate comparative essays for same student profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body (handle empty body gracefully)
    let body: any = {};
    try {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await request.text();
        if (text && text.trim().length > 0) {
          body = JSON.parse(text);
        }
      }
    } catch (e) {
      // Empty body is fine, we don't require any parameters
      console.log('No request body provided or failed to parse, using defaults');
    }
    const { scholarshipTypes } = body; // Optional: can specify which types to generate

    // Fetch user profile from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    // Get Clerk user data for name
    const clerkUser = await currentUser();
    const userName = clerkUser?.fullName || 
      `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || 
      user.name || 
      'Student';

    // Format student profile
    const studentProfile = JSON.stringify({
      name: userName,
      gpa: user.profile.gpaString || user.profile.gpa.toString(),
      major: user.profile.major,
      extracurriculars: user.profile.extracurriculars,
      achievements: user.profile.achievements,
      personalBackground: user.profile.personalBackground,
      writingSample: user.profile.writingSample || '',
    }, null, 2);

    // Check API key
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Generate comparative essays with timeout
    console.log('Starting comparative essay generation...');
    const startTime = Date.now();
    
    let resultRaw: string;
    try {
      resultRaw = await Promise.race([
        comparativeChain.invoke({
          studentProfile,
        }),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 120 seconds')), 120000)
        )
      ]) as string;
    } catch (chainError) {
      console.error('Chain invocation error:', chainError);
      if (chainError instanceof Error && chainError.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timed out. The essay generation is taking too long. Please try again.' },
          { status: 504 }
        );
      }
      throw chainError;
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`Essay generation completed in ${elapsedTime}ms`);

    if (!resultRaw || resultRaw.trim().length === 0) {
      console.error('Empty response from Claude');
      return NextResponse.json(
        { error: 'Received empty response from AI. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Raw response length:', resultRaw.length);
    console.log('Raw response preview:', resultRaw.substring(0, 200));

    const result = parseJSON(resultRaw);

    // Validate result structure
    if (!result || !result.essays || !Array.isArray(result.essays)) {
      console.error('Invalid result structure:', result);
      return NextResponse.json(
        { error: 'Invalid response format from AI. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      essays: result.essays || [],
      comparison: result.comparison || {},
    });
  } catch (error) {
    console.error('Comparative essay generation error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate comparative essays';
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'API configuration error. Please contact support.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Failed to parse AI response. Please try again.';
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

