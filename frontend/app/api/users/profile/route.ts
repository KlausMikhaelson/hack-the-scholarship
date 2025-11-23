import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST - Create user profile (onboarding)
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
    const { gpa, major, extracurriculars, achievements, personalBackground, writingSample } = body;

    // Get Clerk user data to sync name and email
    const clerkUser = await currentUser();
    const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    const clerkFirstName = clerkUser?.firstName || '';
    const clerkLastName = clerkUser?.lastName || '';
    const clerkName = clerkUser?.fullName || 
      `${clerkFirstName} ${clerkLastName}`.trim() || 
      clerkEmail.split('@')[0] || 
      'User';

    // Parse GPA to float (handle string inputs like "3.8")
    const gpaFloat = parseFloat(gpa);
    if (isNaN(gpaFloat) || gpaFloat < 0 || gpaFloat > 4.0) {
      return NextResponse.json(
        { error: 'Invalid GPA. Must be between 0.0 and 4.0' },
        { status: 400 }
      );
    }

    // Find or create user by Clerk ID
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create new user if doesn't exist, sync from Clerk
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkEmail,
          name: clerkName,
          firstName: clerkFirstName,
          lastName: clerkLastName,
          onboardingCompleted: false,
        },
      });
    } else {
      // Update existing user with latest Clerk data
      user = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          email: clerkEmail || user.email,
          name: clerkName || user.name,
          firstName: clerkFirstName || user.firstName,
          lastName: clerkLastName || user.lastName,
        },
      });
    }

    // Check if profile already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          gpa: gpaFloat,
          gpaString: gpa,
          major,
          extracurriculars,
          achievements,
          personalBackground,
          writingSample: writingSample || null,
        },
      });
    } else {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          gpa: gpaFloat,
          gpaString: gpa,
          major,
          extracurriculars,
          achievements,
          personalBackground,
          writingSample: writingSample || null,
        },
      });
    }

    // Mark onboarding as completed
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
      },
      profile: {
        id: profile.id,
        userId: profile.userId,
        gpa: profile.gpa,
        gpaString: profile.gpaString,
        major: profile.major,
        extracurriculars: profile.extracurriculars,
        achievements: profile.achievements,
        personalBackground: profile.personalBackground,
        writingSample: profile.writingSample,
      },
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gpa, major, extracurriculars, achievements, personalBackground, writingSample } = body;

    // Get Clerk user data to sync name and email
    const clerkUser = await currentUser();
    const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    const clerkFirstName = clerkUser?.firstName || '';
    const clerkLastName = clerkUser?.lastName || '';
    const clerkName = clerkUser?.fullName || 
      `${clerkFirstName} ${clerkLastName}`.trim() || 
      clerkEmail.split('@')[0] || 
      'User';

    // Get user by Clerk ID
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with latest Clerk data
    user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        email: clerkEmail || user.email,
        name: clerkName || user.name,
        firstName: clerkFirstName || user.firstName,
        lastName: clerkLastName || user.lastName,
      },
    });

    // Update profile
    const updateData: any = {};
    if (gpa !== undefined) {
      const gpaFloat = parseFloat(gpa);
      if (!isNaN(gpaFloat) && gpaFloat >= 0 && gpaFloat <= 4.0) {
        updateData.gpa = gpaFloat;
        updateData.gpaString = gpa;
      }
    }
    if (major !== undefined) updateData.major = major;
    if (extracurriculars !== undefined) updateData.extracurriculars = extracurriculars;
    if (achievements !== undefined) updateData.achievements = achievements;
    if (personalBackground !== undefined) updateData.personalBackground = personalBackground;
    if (writingSample !== undefined) updateData.writingSample = writingSample || null;

    const profile = await prisma.userProfile.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json({ 
      profile,
      user: {
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get latest Clerk data to ensure we return current name/email
    const clerkUser = await currentUser();
    const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || user.email;
    const clerkFirstName = clerkUser?.firstName || user.firstName || '';
    const clerkLastName = clerkUser?.lastName || user.lastName || '';
    const clerkName = clerkUser?.fullName || user.name || 
      `${clerkFirstName} ${clerkLastName}`.trim() || 
      clerkEmail.split('@')[0] || 
      'User';

    return NextResponse.json({ 
      profile: user.profile,
      user: {
        name: clerkName,
        email: clerkEmail,
        firstName: clerkFirstName,
        lastName: clerkLastName,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

