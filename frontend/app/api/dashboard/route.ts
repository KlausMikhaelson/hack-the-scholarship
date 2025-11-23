import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In production, check actual user from Clerk/DB
    // For now, return mock dashboard data
    
    // Check if user has completed onboarding
    // const user = await currentUser(); // Clerk
    // const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    
    // Mock: assume user has completed onboarding
    const hasProfile = true;

    if (!hasProfile) {
      return NextResponse.json({ needsOnboarding: true });
    }

    // Mock dashboard stats
    const dashboardData = {
      stats: {
        totalApplications: 3,
        inProgress: 2,
        submitted: 1,
        scholarshipsAvailable: 12,
      },
      recentApplications: [
        { 
          id: '1', 
          scholarshipName: 'Gates Millennium Scholarship', 
          status: 'IN_PROGRESS', 
          updatedAt: '2 hours ago' 
        },
        { 
          id: '2', 
          scholarshipName: 'Google Generation Scholarship', 
          status: 'DRAFT', 
          updatedAt: '1 day ago' 
        },
        { 
          id: '3', 
          scholarshipName: 'Coca-Cola Scholars Program', 
          status: 'SUBMITTED', 
          updatedAt: '3 days ago' 
        },
      ]
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
