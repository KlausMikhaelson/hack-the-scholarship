import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update application (save edited essay)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { editedEssay, status } = body;
    const applicationId = params.id;

    // Mock update - replace with actual DB call
    const updated = {
      id: applicationId,
      editedEssay,
      status,
      updatedAt: new Date().toISOString(),
    };

    // In production: await prisma.application.update({ where: { id: applicationId }, data: { ... } })

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// GET - Fetch application details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

    // Mock application - replace with actual DB call
    const mockApplication = {
      id: applicationId,
      scholarshipName: 'Gates Millennium Scholarship',
      generatedEssay: 'Generated essay content...',
      editedEssay: null,
      status: 'IN_PROGRESS',
      updatedAt: new Date().toISOString(),
    };

    // In production: const app = await prisma.application.findUnique({ where: { id: applicationId }, include: { scholarship: true } })

    return NextResponse.json({ application: mockApplication });
  } catch (error) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

