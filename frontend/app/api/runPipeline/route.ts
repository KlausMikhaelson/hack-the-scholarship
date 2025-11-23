import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student, scholarship } = body;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock pipeline result
    const result = {
      scholarshipPersonality: {
        extractedValues: [
          'Innovation and Creativity',
          'Community Impact',
          'Academic Excellence',
          'Leadership Potential',
          'Diversity and Inclusion'
        ],
        priorityThemes: [
          'Technical Innovation',
          'Problem-Solving Mindset',
          'Social Responsibility',
          'Collaborative Leadership'
        ],
        hiddenPatterns: [
          'Emphasis on real-world application of skills',
          'Preference for interdisciplinary approaches',
          'Focus on sustainable and scalable solutions',
          'Value placed on mentorship and giving back'
        ]
      },
      adaptiveWeights: [
        { label: 'Academic Excellence', weight: 0.35 },
        { label: 'Leadership', weight: 0.25 },
        { label: 'Innovation', weight: 0.20 },
        { label: 'Community Service', weight: 0.15 },
        { label: 'Personal Growth', weight: 0.05 }
      ],
      strengthMapping: [
        {
          scholarshipValue: 'Leadership',
          studentStrength: student.extracurriculars?.split('\n')[0] || 'Team leadership experience',
          evidence: 'Demonstrated through extracurricular activities'
        },
        {
          scholarshipValue: 'Innovation',
          studentStrength: student.achievements?.split('\n')[0] || 'Creative problem-solving',
          evidence: 'Highlighted in achievements section'
        },
        {
          scholarshipValue: 'Academic Excellence',
          studentStrength: `${student.gpa} GPA in ${student.major}`,
          evidence: 'Strong academic record'
        },
        {
          scholarshipValue: 'Community Impact',
          studentStrength: 'Volunteer and service work',
          evidence: 'Personal background and extracurriculars'
        },
        {
          scholarshipValue: 'Resilience',
          studentStrength: 'Overcoming challenges',
          evidence: 'Personal background narrative'
        }
      ],
      tailoredEssay: generateMockEssay(student, scholarship),
      explainability: [
        {
          value: 'Academic Excellence',
          weight: 0.35,
          whyItMatters: 'The scholarship emphasizes strong academic performance as a foundation for future success and leadership potential.',
          howStudentMeetsIt: `${student.name} maintains a ${student.gpa} GPA while studying ${student.major}, demonstrating consistent academic dedication and intellectual curiosity.`
        },
        {
          value: 'Leadership',
          weight: 0.25,
          whyItMatters: 'Leadership ability is crucial for creating positive change and inspiring others to contribute to their communities.',
          howStudentMeetsIt: `Through ${student.extracurriculars?.split('\n')[0] || 'various activities'}, ${student.name} has shown initiative in guiding teams and taking on responsibility.`
        },
        {
          value: 'Innovation',
          weight: 0.20,
          whyItMatters: 'The scholarship seeks students who think creatively and develop novel solutions to complex problems.',
          howStudentMeetsIt: `${student.name}'s achievements in ${student.achievements?.split('\n')[0] || 'various projects'} demonstrate creative problem-solving and technical innovation.`
        },
        {
          value: 'Community Service',
          weight: 0.15,
          whyItMatters: 'Commitment to service reflects values of empathy, social responsibility, and desire to make a positive impact.',
          howStudentMeetsIt: 'Active involvement in community-oriented activities shows dedication to serving others and creating meaningful change.'
        },
        {
          value: 'Personal Growth',
          weight: 0.05,
          whyItMatters: 'Demonstrated resilience and ability to learn from challenges indicates strong character and future potential.',
          howStudentMeetsIt: `${student.name}'s personal journey, as shared in their background, shows continuous growth and determination.`
        }
      ],
      originalSample: student.writingSample || undefined
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Pipeline error:', error);
    return NextResponse.json(
      { error: 'Failed to process pipeline' },
      { status: 500 }
    );
  }
}

function generateMockEssay(student: any, scholarship: any): string {
  return `As a ${student.major} student with a ${student.gpa} GPA, I am deeply passionate about leveraging my skills to create meaningful impact in my community and beyond. The ${scholarship.name} aligns perfectly with my values and aspirations.

Throughout my academic journey, I have consistently demonstrated excellence not just in the classroom, but in applying my knowledge to real-world challenges. ${student.achievements?.split('\n')[0] || 'My achievements'} exemplify my commitment to innovation and pushing boundaries.

Leadership has been a cornerstone of my personal development. Through ${student.extracurriculars?.split('\n')[0] || 'my extracurricular activities'}, I have learned the importance of collaboration, empathy, and inspiring others to work toward common goals. These experiences have shaped my understanding that true leadership is about empowering others and creating lasting positive change.

${student.personalBackground?.substring(0, 200) || 'My personal background has taught me resilience and determination.'} These experiences have instilled in me a deep appreciation for education and the opportunities it creates, not just for myself, but for my entire community.

I am particularly drawn to the ${scholarship.name} because it recognizes the importance of holistic excellence—balancing academic achievement with community service, leadership, and personal growth. This scholarship would enable me to continue my education while expanding my capacity to serve others and contribute to solving pressing challenges in ${student.major} and beyond.

Looking forward, I am committed to using my education to create innovative solutions that benefit society, mentor future students, and give back to communities that have supported me. I am excited about the opportunity to join a network of scholars who share these values and are dedicated to making a meaningful difference in the world.

Thank you for considering my application. I am honored to be considered for this prestigious scholarship and am eager to contribute to its mission of supporting students who are committed to excellence, service, and positive change.`;
}
