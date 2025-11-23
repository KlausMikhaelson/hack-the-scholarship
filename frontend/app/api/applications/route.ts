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

    // Get user with applications from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
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

    // Format applications for frontend
    const applications = (user.applications || []).map((app: any) => ({
      id: app.id,
      scholarshipId: app.scholarshipId,
      scholarshipName: app.scholarship?.name || 'Unknown Scholarship',
      status: app.status,
      updatedAt: app.updatedAt,
      createdAt: app.createdAt,
      progress: calculateProgress(app),
    }));

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// Helper function to calculate progress based on application state
function calculateProgress(app: any): number {
  if (app.status === 'SUBMITTED') return 100;
  if (app.status === 'IN_PROGRESS') {
    // If edited essay exists, consider it more complete
    return app.editedEssay ? 75 : 50;
  }
  if (app.status === 'DRAFT') return 30;
  return 0;
}

