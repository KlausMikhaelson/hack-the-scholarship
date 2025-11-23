import { NextRequest, NextResponse } from 'next/server';

// POST - Create user profile (onboarding)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, gpa, major, extracurriculars, achievements, personalBackground, writingSample } = body;

    // Mock user creation - replace with actual DB call
    const mockUser = {
      id: 'user-' + Date.now(),
      email,
      name,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockProfile = {
      id: 'profile-' + Date.now(),
      userId: mockUser.id,
      gpa,
      major,
      extracurriculars,
      achievements,
      personalBackground,
      writingSample,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production: save to database via Prisma
    // const user = await prisma.user.create({ data: { ... } })
    // const profile = await prisma.userProfile.create({ data: { ... } })

    return NextResponse.json({ user: mockUser, profile: mockProfile });
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock update - replace with actual DB call
    const updated = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // In production: await prisma.userProfile.update({ where: { userId }, data: { ... } })

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    // Mock profile - replace with actual DB call
    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      gpa: '3.8',
      major: 'Computer Science',
      extracurriculars: 'Robotics Club Captain, Volunteer Tutor',
      achievements: 'National Merit Scholar, Hackathon Winner',
      personalBackground: 'First-generation college student passionate about using technology for social good.',
      writingSample: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production: const profile = await prisma.userProfile.findUnique({ where: { userId } })

    return NextResponse.json({ profile: mockProfile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

