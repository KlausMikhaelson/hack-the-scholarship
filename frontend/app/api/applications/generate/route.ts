import { NextRequest, NextResponse } from 'next/server';
import scholarshipsData from '@/data/sample_scholarships.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scholarshipId, profileId } = body;

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get scholarship
    const scholarship = scholarshipsData.find(s => s.id === scholarshipId);
    
    if (!scholarship) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    // Mock user profile (in production, fetch from DB)
    const mockProfile = {
      name: 'John Doe',
      gpa: '3.8',
      major: 'Computer Science',
      extracurriculars: 'Robotics Club Captain, Volunteer Tutor',
      achievements: 'National Merit Scholar, Hackathon Winner',
      personalBackground: 'First-generation college student passionate about using technology for social good.',
      writingSample: '',
    };

    // Generate pipeline result
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
          studentStrength: 'Robotics Club Captain',
          evidence: 'Demonstrated through extracurricular activities'
        },
        {
          scholarshipValue: 'Innovation',
          studentStrength: 'Hackathon Winner',
          evidence: 'Highlighted in achievements section'
        },
        {
          scholarshipValue: 'Academic Excellence',
          studentStrength: `${mockProfile.gpa} GPA in ${mockProfile.major}`,
          evidence: 'Strong academic record'
        },
        {
          scholarshipValue: 'Community Impact',
          studentStrength: 'Volunteer Tutor',
          evidence: 'Personal background and extracurriculars'
        },
        {
          scholarshipValue: 'First-Gen Student',
          studentStrength: 'First-generation college student',
          evidence: 'Personal background narrative'
        }
      ],
      tailoredEssay: generateEssay(mockProfile, scholarship),
      explainability: [
        {
          value: 'Academic Excellence',
          weight: 0.35,
          whyItMatters: 'The scholarship emphasizes strong academic performance as a foundation for future success.',
          howStudentMeetsIt: `${mockProfile.name} maintains a ${mockProfile.gpa} GPA while studying ${mockProfile.major}.`
        },
        {
          value: 'Leadership',
          weight: 0.25,
          whyItMatters: 'Leadership ability is crucial for creating positive change and inspiring others.',
          howStudentMeetsIt: 'Serves as Robotics Club Captain, demonstrating leadership and initiative.'
        },
        {
          value: 'Innovation',
          weight: 0.20,
          whyItMatters: 'The scholarship seeks students who develop novel solutions to complex problems.',
          howStudentMeetsIt: 'Hackathon winner showing creative problem-solving and technical innovation.'
        },
        {
          value: 'Community Service',
          weight: 0.15,
          whyItMatters: 'Commitment to service reflects empathy and social responsibility.',
          howStudentMeetsIt: 'Active as volunteer tutor, dedicated to serving others.'
        },
        {
          value: 'Personal Growth',
          weight: 0.05,
          whyItMatters: 'Resilience and ability to overcome challenges indicates strong character.',
          howStudentMeetsIt: 'First-generation student showing determination and growth mindset.'
        }
      ],
      originalSample: mockProfile.writingSample || undefined
    };

    // In production: save to database
    // await prisma.application.create({
    //   data: {
    //     userId,
    //     scholarshipId,
    //     generatedEssay: result.tailoredEssay,
    //     explainabilityMatrix: result.explainability,
    //     adaptiveWeights: result.adaptiveWeights,
    //     scholarshipPersonality: result.scholarshipPersonality,
    //     strengthMapping: result.strengthMapping,
    //   }
    // })

    return NextResponse.json(result);
  } catch (error) {
    console.error('Application generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate application' },
      { status: 500 }
    );
  }
}

function generateEssay(profile: any, scholarship: any): string {
  return `As a ${profile.major} student with a ${profile.gpa} GPA, I am deeply passionate about leveraging my skills to create meaningful impact in my community and beyond. The ${scholarship.name} aligns perfectly with my values and aspirations.

Throughout my academic journey, I have consistently demonstrated excellence not just in the classroom, but in applying my knowledge to real-world challenges. My work as ${profile.extracurriculars.split(',')[0]} exemplifies my commitment to innovation and pushing boundaries.

Leadership has been a cornerstone of my personal development. Through my ${profile.extracurriculars.split(',')[1]?.trim() || 'volunteer work'}, I have learned the importance of collaboration, empathy, and inspiring others to work toward common goals.

${profile.personalBackground}

I am particularly drawn to the ${scholarship.name} because it recognizes the importance of holistic excellence—balancing academic achievement with community service, leadership, and personal growth. This scholarship would enable me to continue my education while expanding my capacity to serve others.

Looking forward, I am committed to using my education to create innovative solutions that benefit society, mentor future students, and give back to communities that have supported me. Thank you for considering my application.`;
}

