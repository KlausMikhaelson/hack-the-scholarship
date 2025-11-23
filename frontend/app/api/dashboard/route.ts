import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper function to check if profile is complete
function checkProfileCompleteness(profile: any): boolean {
  if (!profile) return false;
  
  const requiredFields = ['gpa', 'major', 'extracurriculars', 'achievements', 'personalBackground'];
  
  return requiredFields.every(field => {
    const value = profile[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
  });
}

// Helper function to calculate progress
function calculateProgress(app: any, isProfileComplete: boolean): { progress: number; readyToFill: boolean } {
  if (app.status === 'SUBMITTED') {
    return { progress: 100, readyToFill: false };
  }
  
  if (isProfileComplete && app.generatedEssay) {
    if (app.status === 'DRAFT') {
      return { progress: 90, readyToFill: true };
    }
    if (app.status === 'IN_PROGRESS') {
      return { progress: app.editedEssay ? 95 : 90, readyToFill: true };
    }
  }
  
  if (isProfileComplete && !app.generatedEssay) {
    return { progress: 50, readyToFill: false };
  }
  
  if (!isProfileComplete) {
    if (app.status === 'IN_PROGRESS') {
      return { progress: app.editedEssay ? 40 : 25, readyToFill: false };
    }
    if (app.status === 'DRAFT') {
      return { progress: 15, readyToFill: false };
    }
    return { progress: 0, readyToFill: false };
  }
  
  if (app.status === 'IN_PROGRESS') {
    return { progress: app.editedEssay ? 75 : 50, readyToFill: false };
  }
  if (app.status === 'DRAFT') {
    return { progress: 30, readyToFill: false };
  }
  
  return { progress: 0, readyToFill: false };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with profile and applications
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
          take: 5, // Get 5 most recent
        },
      },
    });

    if (!user) {
      return NextResponse.json({ needsOnboarding: true });
    }

    // Check if profile is complete
    const isProfileComplete = checkProfileCompleteness(user.profile);
    
    if (!user.profile) {
      return NextResponse.json({ needsOnboarding: true });
    }

    // Count applications by status
    const totalApplications = user.applications.length;
    const inProgress = user.applications.filter(app => app.status === 'IN_PROGRESS').length;
    const submitted = user.applications.filter(app => app.status === 'SUBMITTED').length;
    
    // Count available scholarships (simplified - could be improved with matching logic)
    const scholarshipsAvailable = await prisma.scholarship.count();

    // Format recent applications
    const recentApplications = user.applications.map((app: any) => {
      const progressData = calculateProgress(app, isProfileComplete);
      const updatedAt = app.updatedAt;
      const now = new Date();
      const diffInMs = now.getTime() - updatedAt.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      let updatedAtStr = 'Just now';
      if (diffInHours >= 1 && diffInHours < 24) {
        updatedAtStr = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else if (diffInDays >= 1 && diffInDays < 7) {
        updatedAtStr = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else if (diffInDays >= 7) {
        updatedAtStr = updatedAt.toLocaleDateString();
      }

      return {
        id: app.id,
        scholarshipName: app.scholarship?.name || 'Unknown Scholarship',
        status: app.status,
        updatedAt: updatedAtStr,
        readyToFill: progressData.readyToFill,
      };
    });

    const dashboardData = {
      stats: {
        totalApplications,
        inProgress,
        submitted,
        scholarshipsAvailable,
      },
      recentApplications,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
