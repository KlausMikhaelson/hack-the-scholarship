import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering to prevent Prisma from initializing during build
export const dynamic = 'force-dynamic';

// Helper function to check if profile is complete
function checkProfileCompleteness(profile: any): boolean {
  if (!profile) return false;
  
  // Required fields for a complete profile
  const requiredFields = [
    'gpa',
    'major',
    'extracurriculars',
    'achievements',
    'personalBackground',
  ];
  
  // Check if all required fields are present and not empty
  return requiredFields.every(field => {
    const value = profile[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
  });
}

// PATCH - Update application (save edited essay)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { editedEssay, status } = body;
    const applicationId = params.id;

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify application belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update application
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        editedEssay: editedEssay || undefined,
        status: status || undefined,
      },
      include: {
        scholarship: true,
      },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Fetch application details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applicationId = params.id;

    // Get user with profile to verify ownership and check completeness
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch application with scholarship details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        scholarship: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (application.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if profile is complete
    const isProfileComplete = user.profile ? checkProfileCompleteness(user.profile) : false;
    const readyToFill = isProfileComplete && !!application.generatedEssay && application.status !== 'SUBMITTED';

    // Format response
    const formatted = {
      id: application.id,
      scholarshipId: application.scholarshipId,
      scholarshipName: application.scholarship?.name || 'Unknown Scholarship',
      generatedEssay: application.generatedEssay,
      editedEssay: application.editedEssay,
      status: application.status,
      updatedAt: application.updatedAt.toISOString(),
      createdAt: application.createdAt.toISOString(),
      scholarshipPersonality: application.scholarshipPersonality as any,
      adaptiveWeights: application.adaptiveWeights as any,
      strengthMapping: application.strengthMapping as any,
      explainabilityMatrix: application.explainabilityMatrix as any,
      readyToFill,
      isProfileComplete,
    };

    return NextResponse.json({ application: formatted });
  } catch (error) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

