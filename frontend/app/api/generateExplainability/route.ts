import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student, scholarship, weights } = body;

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const explainability = [
      {
        value: 'Academic Excellence',
        weight: 0.35,
        whyItMatters: 'The scholarship emphasizes strong academic performance as a foundation for future success and leadership potential.',
        howStudentMeetsIt: `${student.name} maintains a ${student.gpa} GPA while studying ${student.major}, demonstrating consistent academic dedication.`
      },
      {
        value: 'Leadership',
        weight: 0.25,
        whyItMatters: 'Leadership ability is crucial for creating positive change and inspiring others to contribute to their communities.',
        howStudentMeetsIt: `Through various activities, ${student.name} has shown initiative in guiding teams and taking on responsibility.`
      },
      {
        value: 'Innovation',
        weight: 0.20,
        whyItMatters: 'The scholarship seeks students who think creatively and develop novel solutions to complex problems.',
        howStudentMeetsIt: `Achievements demonstrate creative problem-solving and technical innovation.`
      },
      {
        value: 'Community Service',
        weight: 0.15,
        whyItMatters: 'Commitment to service reflects values of empathy, social responsibility, and desire to make a positive impact.',
        howStudentMeetsIt: 'Active involvement in community-oriented activities shows dedication to serving others.'
      },
      {
        value: 'Personal Growth',
        weight: 0.05,
        whyItMatters: 'Demonstrated resilience and ability to learn from challenges indicates strong character and future potential.',
        howStudentMeetsIt: 'Personal journey shows continuous growth and determination.'
      }
    ];

    return NextResponse.json({ explainability });
  } catch (error) {
    console.error('Explainability generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explainability' },
      { status: 500 }
    );
  }
}
