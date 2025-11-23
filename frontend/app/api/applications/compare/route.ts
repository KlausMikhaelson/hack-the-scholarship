import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
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

    const body = await request.json();
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

    // Generate comparative essays
    const resultRaw = await comparativeChain.invoke({
      studentProfile,
    });

    const result = parseJSON(resultRaw);

    return NextResponse.json({
      essays: result.essays || [],
      comparison: result.comparison || {},
    });
  } catch (error) {
    console.error('Comparative essay generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparative essays', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

