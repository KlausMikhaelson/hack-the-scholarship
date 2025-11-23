import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Seed sample scholarships (for development/testing)
export async function POST(request: NextRequest) {
  try {
    // Check if scholarships already exist
    const existingCount = await prisma.scholarship.count();
    
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Database already contains ${existingCount} scholarships`,
        seeded: false,
      });
    }

    // Sample scholarships to seed
    const sampleScholarships = [
      {
        name: 'Gates Millennium Scholarship',
        description: 'The Gates Millennium Scholars Program provides outstanding African American, American Indian/Alaska Native, Asian Pacific Islander American, and Hispanic American students with an opportunity to complete an undergraduate college education in any discipline area of interest.',
        minimumGPA: 3.3,
        financialNeed: true,
        academicMerit: true,
        isPreloaded: true,
        source: 'sample',
      },
      {
        name: 'Google Generation Scholarship',
        description: 'Google is committed to helping the innovators of tomorrow make the most of their talents by providing scholarships for students pursuing computer science and technology degrees.',
        minimumGPA: 3.0,
        academicMerit: true,
        fieldsOfStudy: ['Computer Science', 'Engineering', 'Technology'],
        isPreloaded: true,
        source: 'sample',
      },
      {
        name: 'Coca-Cola Scholars Program',
        description: 'The Coca-Cola Scholars Program scholarship is an achievement-based scholarship awarded to graduating high school seniors. Students are recognized for their capacity to lead and serve.',
        minimumGPA: 3.0,
        academicMerit: true,
        isPreloaded: true,
        source: 'sample',
      },
      {
        name: 'National Merit Scholarship',
        description: 'The National Merit Scholarship Program is an academic competition for recognition and scholarships. High school students enter by taking the PSAT/NMSQT.',
        academicMerit: true,
        isPreloaded: true,
        source: 'sample',
      },
      {
        name: 'Dell Scholars Program',
        description: 'The Dell Scholars Program supports students who demonstrate determination to succeed despite facing significant obstacles. This scholarship recognizes students who are gritty, determined, and ambitious.',
        minimumGPA: 2.4,
        financialNeed: true,
        isPreloaded: true,
        source: 'sample',
      },
    ];

    // Create scholarships
    const created = await prisma.scholarship.createMany({
      data: sampleScholarships,
    });

    return NextResponse.json({
      message: `Successfully seeded ${created.count} scholarships`,
      seeded: true,
      count: created.count,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed scholarships', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

