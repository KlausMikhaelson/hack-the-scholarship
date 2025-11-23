import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { processScholarshipApplication } from '@/lib/claude';

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
    const { scholarshipId } = body;

    if (!scholarshipId) {
      return NextResponse.json(
        { error: 'Scholarship ID is required' },
        { status: 400 }
      );
    }

    // Fetch scholarship from database
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      return NextResponse.json(
        { error: 'Scholarship not found' },
        { status: 404 }
      );
    }

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
    const studentProfile = {
      name: userName,
      gpa: user.profile.gpaString || user.profile.gpa.toString(),
      major: user.profile.major,
      extracurriculars: user.profile.extracurriculars,
      achievements: user.profile.achievements,
      personalBackground: user.profile.personalBackground,
      writingSample: user.profile.writingSample || '',
    };

    // Format scholarship info for Claude
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

    // Format student profile for Claude
    const studentProfileStr = JSON.stringify(studentProfile, null, 2);

    // Process through Claude pipeline
    const pipelineResult = await processScholarshipApplication(
      scholarshipInfo,
      studentProfileStr,
      "500 words",
      studentProfile.writingSample || "",
      [] // TODO: Add winner essays when pattern miner is implemented
    );

    // Format response - profileWeights returns criteria array, convert to weights format
    const criteria = pipelineResult.profileWeights.criteria || [];
    const adaptiveWeights = criteria.map((criterion: any) => ({
      label: criterion.name || criterion.label || criterion.criterion || 'Unknown',
      weight: criterion.weight || 0,
    }));

    // Calculate total weight and normalize if needed
    const totalWeight = adaptiveWeights.reduce((sum: number, w: any) => sum + (w.weight || 0), 0);
    if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.01) {
      // Normalize weights to sum to 1.0
      adaptiveWeights.forEach((w: any) => {
        w.weight = w.weight / totalWeight;
      });
    }

    // Format response
    const result = {
      scholarshipPersonality: {
        extractedValues: pipelineResult.scholarshipAnalysis.values || [],
        priorityThemes: pipelineResult.scholarshipAnalysis.themes || [],
        hiddenPatterns: pipelineResult.scholarshipAnalysis.patterns || [],
        keywords: pipelineResult.scholarshipAnalysis.keywords || [],
        emphasis: pipelineResult.scholarshipAnalysis.emphasis || [],
      },
      adaptiveWeights: adaptiveWeights,
      strengthMapping: [
        ...(pipelineResult.studentEvaluation.strongMatches || []).map((match: string) => ({
          scholarshipValue: match,
          studentStrength: match,
          evidence: `Student excels in ${match.toLowerCase()}`,
        })),
        ...(pipelineResult.studentEvaluation.standoutQualities || []).map((quality: string) => ({
          scholarshipValue: quality,
          studentStrength: quality,
          evidence: `Student demonstrates ${quality.toLowerCase()}`,
        })),
      ],
      tailoredEssay: pipelineResult.essay.essay || '',
      explainability: adaptiveWeights.map((weight: any) => ({
        value: weight.label,
        weight: weight.weight,
        whyItMatters: `This criterion is important for evaluating scholarship candidates.`,
        howStudentMeetsIt: pipelineResult.studentEvaluation.strongMatches?.includes(weight.label) 
          ? `Student demonstrates strong performance in ${weight.label.toLowerCase()}.`
          : `Student shows potential in ${weight.label.toLowerCase()}.`,
      })),
      originalSample: studentProfile.writingSample || undefined,
      explanation: pipelineResult.essay.explanation || {},
    };

    // Save to database
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        scholarshipId: scholarship.id,
        generatedEssay: result.tailoredEssay,
        explainabilityMatrix: result.explainability,
        adaptiveWeights: result.adaptiveWeights,
        scholarshipPersonality: result.scholarshipPersonality,
        strengthMapping: result.strengthMapping,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({
      ...result,
      applicationId: application.id,
    });
  } catch (error) {
    console.error('Application generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

