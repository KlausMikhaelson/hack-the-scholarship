import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Get dashboard stats and recent applications
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with applications from database
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
      // User not found, needs onboarding
      return NextResponse.json({
        needsOnboarding: true,
        stats: {
          totalApplications: 0,
          inProgress: 0,
          submitted: 0,
          scholarshipsAvailable: 0,
        },
        recentApplications: [],
      });
    }

    // Check if user has completed onboarding
    if (!user.onboardingCompleted || !user.profile) {
      return NextResponse.json({
        needsOnboarding: true,
        stats: {
          totalApplications: 0,
          inProgress: 0,
          submitted: 0,
          scholarshipsAvailable: 0,
        },
        recentApplications: [],
      });
    }

    const applications = user.applications || [];

    // Calculate stats
    const stats = {
      totalApplications: applications.length,
      inProgress: applications.filter((app: any) => 
        app.status === 'IN_PROGRESS' || app.status === 'DRAFT'
      ).length,
      submitted: applications.filter((app: any) => 
        app.status === 'SUBMITTED'
      ).length,
      scholarshipsAvailable: 0, // TODO: Get from scholarships API
    };

    // Get recent applications (last 5, ordered by updatedAt)
    const recentApplications = applications
      .sort((a: any, b: any) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5)
      .map((app: any) => ({
        id: app.id,
        scholarshipName: app.scholarship?.name || 'Unknown Scholarship',
        status: app.status,
        updatedAt: formatRelativeTime(app.updatedAt),
      }));

    return NextResponse.json({
      needsOnboarding: false,
      stats,
      recentApplications,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
}

