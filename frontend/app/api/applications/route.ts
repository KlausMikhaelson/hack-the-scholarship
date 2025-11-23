import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - List all applications for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with applications and profile from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        applications: {
          include: {
            scholarship: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      // User not found, return empty applications
      return NextResponse.json({ applications: [] });
    }

    // Check if profile is complete (has all required fields)
    const isProfileComplete = checkProfileCompleteness(user.profile);

    // Format applications for frontend
    const applications = (user.applications || []).map((app: any) => {
      const progressData = calculateProgress(app, isProfileComplete);
      return {
        id: app.id,
        scholarshipId: app.scholarshipId,
        scholarshipName: app.scholarship?.name || 'Unknown Scholarship',
        status: app.status,
        updatedAt: app.updatedAt,
        createdAt: app.createdAt,
        progress: progressData.progress,
        readyToFill: progressData.readyToFill,
      };
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

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

// Helper function to calculate progress based on application state and profile completeness
function calculateProgress(app: any, isProfileComplete: boolean): { progress: number; readyToFill: boolean } {
  // If submitted, it's 100% complete
  if (app.status === 'SUBMITTED') {
    return { progress: 100, readyToFill: false };
  }
  
  // If profile is complete and essay is generated, it's ready to fill
  if (isProfileComplete && app.generatedEssay) {
    if (app.status === 'DRAFT') {
      return { progress: 90, readyToFill: true };
    }
    if (app.status === 'IN_PROGRESS') {
      // If edited essay exists, it's more complete
      return { progress: app.editedEssay ? 95 : 90, readyToFill: true };
    }
  }
  
  // If profile is complete but no essay yet, it's ready to generate
  if (isProfileComplete && !app.generatedEssay) {
    return { progress: 50, readyToFill: false };
  }
  
  // If profile is incomplete, show lower progress
  if (!isProfileComplete) {
    if (app.status === 'IN_PROGRESS') {
      return { progress: app.editedEssay ? 40 : 25, readyToFill: false };
    }
    if (app.status === 'DRAFT') {
      return { progress: 15, readyToFill: false };
    }
    return { progress: 0, readyToFill: false };
  }
  
  // Default fallback
  if (app.status === 'IN_PROGRESS') {
    return { progress: app.editedEssay ? 75 : 50, readyToFill: false };
  }
  if (app.status === 'DRAFT') {
    return { progress: 30, readyToFill: false };
  }
  
  return { progress: 0, readyToFill: false };
}

