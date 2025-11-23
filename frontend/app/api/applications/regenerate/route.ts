import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scholarshipId, profileId } = body;

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const variations = [
      `This is variation 1 of the regenerated essay with a different tone and structure, focusing more on personal growth and community impact...`,
      `This is variation 2 of the regenerated essay emphasizing leadership and innovation in a more direct, confident voice...`,
      `This is variation 3 of the regenerated essay taking a storytelling approach with vivid examples and emotional resonance...`,
    ];

    const essay = variations[Math.floor(Math.random() * variations.length)];

    return NextResponse.json({ essay });
  } catch (error) {
    console.error('Regeneration error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate essay' },
      { status: 500 }
    );
  }
}

