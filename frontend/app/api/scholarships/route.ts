import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - List all scholarships (matched to user profile if available)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    // Get current user
    const { userId } = await auth();
    let userProfile = null;
    let hasProfile = false;

    if (userId) {
      // Try to get user profile
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { profile: true },
      });

      if (user?.profile) {
        userProfile = user.profile;
        hasProfile = true;
      }
    }

    // Build query conditions for matching
    const whereConditions: any = {};

    if (hasProfile && userProfile) {
      // Build matching conditions based on user profile
      const conditions: any[] = [];

      // GPA matching: user GPA must meet minimum requirement
      if (userProfile.gpa !== null && userProfile.gpa !== undefined) {
        conditions.push({
          OR: [
            { minimumGPA: null }, // Scholarships without GPA requirement
            { minimumGPA: { lte: userProfile.gpa } }, // User GPA meets requirement
          ],
        });
      }

      // Student Status matching: scholarship must include user's status or have no requirement
      if (userProfile.studentStatus) {
        // Include scholarships with empty arrays (no requirement) OR scholarships that include user's status
        conditions.push({
          OR: [
            { studentStatus: { isEmpty: true } }, // No status requirement
            { studentStatus: { has: userProfile.studentStatus } }, // Matches user status
          ],
        });
      }

      // Student Type matching: scholarship must include user's type or have no requirement
      if (userProfile.studentType) {
        conditions.push({
          OR: [
            { studentType: { isEmpty: true } }, // No type requirement
            { studentType: { has: userProfile.studentType } }, // Matches user type
          ],
        });
      }

      // Gender matching: scholarship gender must match or be null
      if (userProfile.gender) {
        conditions.push({
          OR: [
            { gender: null }, // No gender requirement
            { gender: userProfile.gender }, // Matches user gender
          ],
        });
      }

      // Financial Need matching
      // If user has financial need, show need-based scholarships
      // If user doesn't have financial need, show both need-based and merit-based (they can still apply)
      if (userProfile.financialNeed !== null && userProfile.financialNeed !== undefined) {
        if (userProfile.financialNeed) {
          // User has financial need - show need-based scholarships
          conditions.push({
            OR: [
              { financialNeed: false }, // Merit-based scholarships (anyone can apply)
              { financialNeed: true }, // Need-based scholarships (user qualifies)
            ],
          });
        } else {
          // User doesn't have financial need - show all scholarships (they can still apply to need-based)
          // Don't filter by financial need in this case
        }
      }

      // Fields of Study matching: check if scholarship fields overlap with user's fields or major
      if (userProfile.major || (userProfile.fieldsOfStudy && userProfile.fieldsOfStudy.length > 0)) {
        const userFields = [
          userProfile.major,
          ...(userProfile.fieldsOfStudy || []),
        ].filter(Boolean);

        if (userFields.length > 0) {
          conditions.push({
            OR: [
              { fieldsOfStudy: { isEmpty: true } }, // No field requirement
              {
                OR: userFields.map((field) => ({
                  fieldsOfStudy: { has: field },
                })),
              },
            ],
          });
        }
      }

      // Faculty matching
      if (userProfile.faculty) {
        conditions.push({
          OR: [
            { faculty: null }, // No faculty requirement
            { faculty: userProfile.faculty }, // Matches user faculty
          ],
        });
      }

      // Combine all conditions with AND
      if (conditions.length > 0) {
        whereConditions.AND = conditions;
      }
    }

    // Fetch scholarships from database
    let scholarships: any[] = [];
    let isMatched = false;

    // First, try to get all scholarships to see if any exist
    const allScholarships = await prisma.scholarship.findMany({
      take: limit || 100,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Total scholarships in database: ${allScholarships.length}`);
    console.log(`User has profile: ${hasProfile}`);

    if (hasProfile && Object.keys(whereConditions).length > 0) {
      console.log('Matching conditions:', JSON.stringify(whereConditions, null, 2));
      
      try {
        // Try to get matched scholarships
        scholarships = await prisma.scholarship.findMany({
          where: whereConditions,
          take: limit || 100,
          skip: offset,
          orderBy: {
            createdAt: 'desc',
          },
        });
        
        console.log(`Matched scholarships: ${scholarships.length}`);
        isMatched = scholarships.length > 0;
      } catch (queryError) {
        console.error('Query error:', queryError);
        // If query fails, fall back to all scholarships
        scholarships = allScholarships;
      }

      // If no matches found, fall back to general scholarships
      if (!isMatched && scholarships.length === 0) {
        console.log('No matches found, falling back to general scholarships');
        scholarships = allScholarships;
      }
    } else {
      // No profile or no matching conditions - return all scholarships
      scholarships = allScholarships;
    }

    // If no scholarships exist, suggest seeding
    if (scholarships.length === 0 && allScholarships.length === 0) {
      console.log('No scholarships found in database');
    }

    return NextResponse.json({
      scholarships,
      matched: isMatched,
      hasProfile,
      totalMatched: isMatched ? scholarships.length : 0,
      totalAvailable: allScholarships.length,
    });
  } catch (error) {
    console.error('Scholarships fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scholarships', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

