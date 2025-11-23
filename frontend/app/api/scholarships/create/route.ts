import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Create scholarship from form data
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
    const {
      name,
      title,
      description,
      deadline,
      sourceUrl,
      sourceUrls,
      studentStatus,
      studentType,
      faculty,
      fieldsOfStudy,
      gender,
      financialNeed,
      academicMerit,
      minimumGPA,
      citizenship,
      residency,
      enrollmentStatus,
      otherRequirements,
      amount,
      amountMin,
      amountMax,
      amountCurrency,
      tags,
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Parse deadline if provided
    let deadlineDate: Date | null = null;
    if (deadline) {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid deadline date format' },
          { status: 400 }
        );
      }
    }

    // Create scholarship
    const scholarship = await prisma.scholarship.create({
      data: {
        name,
        title: title || null,
        description,
        deadline: deadlineDate,
        sourceUrl: sourceUrl || sourceUrls?.[0] || null,
        isPreloaded: false,
        source: 'manual_scrape',
        
        // Matching fields
        studentStatus: Array.isArray(studentStatus) ? studentStatus : [],
        studentType: Array.isArray(studentType) ? studentType : [],
        faculty: faculty || null,
        fieldsOfStudy: Array.isArray(fieldsOfStudy) ? fieldsOfStudy : [],
        gender: gender || null,
        
        // Requirements
        financialNeed: Boolean(financialNeed),
        academicMerit: Boolean(academicMerit),
        minimumGPA: minimumGPA ? parseFloat(minimumGPA.toString()) : null,
        citizenship: citizenship || null,
        residency: residency || null,
        enrollmentStatus: enrollmentStatus || null,
        otherRequirements: Array.isArray(otherRequirements) ? otherRequirements : [],
        
        // Amount information
        amount: amount || null,
        amountMin: amountMin ? parseFloat(amountMin.toString()) : null,
        amountMax: amountMax ? parseFloat(amountMax.toString()) : null,
        amountCurrency: amountCurrency || 'CAD',
        
        // Metadata
        tags: Array.isArray(tags) ? tags : [],
      },
    });

    return NextResponse.json({
      success: true,
      scholarshipId: scholarship.id,
      scholarship,
    });
  } catch (error) {
    console.error('Scholarship creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create scholarship', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

