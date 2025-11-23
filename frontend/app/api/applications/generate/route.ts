import { NextRequest, NextResponse } from 'next/server';
import scholarshipsData from '@/data/sample_scholarships.json';
import { processScholarshipApplication } from '@/utils/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scholarshipId, profileId } = body;

    // Get scholarship
    const scholarship = scholarshipsData.find(s => s.id === scholarshipId);
    
    if (!scholarship) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    // Mock user profile (in production, fetch from DB)
    const mockProfile = {
      name: 'John Doe',
      gpa: 3.8,
      major: 'Computer Science',
      extracurriculars: 'Robotics Club Captain, Volunteer Tutor',
      achievements: 'National Merit Scholar, Hackathon Winner',
      personalBackground: 'First-generation college student passionate about using technology for social good.',
      writingSample: '',
    };

    // Check if we have Claude API key
    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;

    if (!hasClaudeKey) {
      // Return mock data if no API key
      console.warn('No ANTHROPIC_API_KEY found - returning mock data');
      return NextResponse.json(getMockResult(mockProfile, scholarship));
    }

    try {
      // Call Claude API
      console.log('Calling Claude API for scholarship analysis...');
      const claudeResult = await processScholarshipApplication(
        scholarship.description,
        mockProfile,
        '500-750 words',
        ''
      );

      // Transform Claude response to frontend format
      const result = transformClaudeResponse(claudeResult, mockProfile);
      
      return NextResponse.json(result);
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      console.log('Falling back to mock data...');
      
      // Fallback to mock data if Claude fails
      return NextResponse.json(getMockResult(mockProfile, scholarship));
    }
  } catch (error) {
    console.error('Application generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate application' },
      { status: 500 }
    );
  }
}

function transformClaudeResponse(claudeResult: any, profile: any) {
  // Transform Claude's response to match the frontend's expected format
  const analysis = claudeResult.scholarshipAnalysis;
  const weights = claudeResult.profileWeights;
  const evaluation = claudeResult.studentEvaluation;
  const essay = claudeResult.essay;

  // Convert weights object to array format
  const adaptiveWeightsArray = weights.criteria?.map((c: any) => ({
    label: c.name,
    weight: c.weight / 10 // Normalize from 0-10 to 0-1
  })) || [];

  // Create strength mapping from evaluation
  const strengthMapping = evaluation.strongMatches?.map((match: string, idx: number) => ({
    scholarshipValue: analysis.values[idx] || match,
    studentStrength: match,
    evidence: evaluation.standoutQualities[idx] || 'Demonstrated in profile'
  })) || [];

  // Create explainability from essay value alignment
  const explainability = Object.entries(essay.valueAlignment || {}).map(([value, how]: [string, any]) => {
    const weight = analysis.weights[value] || 5;
    return {
      value,
      weight: weight / 10, // Normalize to 0-1
      whyItMatters: `This value is emphasized in the scholarship description`,
      howStudentMeetsIt: how
    };
  });

  return {
    scholarshipPersonality: {
      extractedValues: analysis.values || [],
      priorityThemes: analysis.themes || [],
      hiddenPatterns: analysis.patterns || []
    },
    adaptiveWeights: adaptiveWeightsArray.length > 0 ? adaptiveWeightsArray : [
      { label: 'Academic Excellence', weight: 0.35 },
      { label: 'Leadership', weight: 0.25 },
      { label: 'Innovation', weight: 0.20 },
      { label: 'Community Service', weight: 0.15 },
      { label: 'Personal Growth', weight: 0.05 }
    ],
    strengthMapping,
    tailoredEssay: essay.essay,
    explainability: explainability.length > 0 ? explainability : [
      {
        value: 'Academic Excellence',
        weight: 0.35,
        whyItMatters: 'Strong academic performance demonstrates dedication',
        howStudentMeetsIt: `${profile.name} maintains a ${profile.gpa} GPA`
      }
    ],
    originalSample: profile.writingSample || undefined
  };
}

function getMockResult(profile: any, scholarship: any) {
  // Fallback mock data when Claude API is not available
  return {
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
        studentStrength: profile.extracurriculars?.split(',')[0] || 'Team leadership experience',
        evidence: 'Demonstrated through extracurricular activities'
      },
      {
        scholarshipValue: 'Innovation',
        studentStrength: profile.achievements?.split(',')[0] || 'Creative problem-solving',
        evidence: 'Highlighted in achievements section'
      },
      {
        scholarshipValue: 'Academic Excellence',
        studentStrength: `${profile.gpa} GPA in ${profile.major}`,
        evidence: 'Strong academic record'
      },
      {
        scholarshipValue: 'Community Impact',
        studentStrength: 'Volunteer and service work',
        evidence: 'Personal background and extracurriculars'
      },
      {
        scholarshipValue: 'First-Gen Student',
        studentStrength: 'First-generation college student',
        evidence: 'Personal background narrative'
      }
    ],
    tailoredEssay: generateMockEssay(profile, scholarship),
    explainability: [
      {
        value: 'Academic Excellence',
        weight: 0.35,
        whyItMatters: 'The scholarship emphasizes strong academic performance as a foundation for future success.',
        howStudentMeetsIt: `${profile.name} maintains a ${profile.gpa} GPA while studying ${profile.major}.`
      },
      {
        value: 'Leadership',
        weight: 0.25,
        whyItMatters: 'Leadership ability is crucial for creating positive change and inspiring others.',
        howStudentMeetsIt: 'Demonstrated leadership through extracurricular activities.'
      },
      {
        value: 'Innovation',
        weight: 0.20,
        whyItMatters: 'The scholarship seeks students who develop novel solutions to complex problems.',
        howStudentMeetsIt: 'Achievements show creative problem-solving and technical innovation.'
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
    originalSample: profile.writingSample || undefined
  };
}

function generateMockEssay(profile: any, scholarship: any): string {
  return `As a ${profile.major} student with a ${profile.gpa} GPA, I am deeply passionate about leveraging my skills to create meaningful impact in my community and beyond. The ${scholarship.name} aligns perfectly with my values and aspirations.

Throughout my academic journey, I have consistently demonstrated excellence not just in the classroom, but in applying my knowledge to real-world challenges. My work as ${profile.extracurriculars?.split(',')[0] || 'a dedicated student'} exemplifies my commitment to innovation and pushing boundaries.

Leadership has been a cornerstone of my personal development. Through my volunteer work, I have learned the importance of collaboration, empathy, and inspiring others to work toward common goals.

${profile.personalBackground}

I am particularly drawn to the ${scholarship.name} because it recognizes the importance of holistic excellence—balancing academic achievement with community service, leadership, and personal growth. This scholarship would enable me to continue my education while expanding my capacity to serve others.

Looking forward, I am committed to using my education to create innovative solutions that benefit society, mentor future students, and give back to communities that have supported me. Thank you for considering my application.`;
}
