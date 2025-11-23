import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student, scholarship, regenerate } = body;

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const variations = [
      generateEssayVariation1(student, scholarship),
      generateEssayVariation2(student, scholarship),
      generateEssayVariation3(student, scholarship)
    ];

    const essay = regenerate 
      ? variations[Math.floor(Math.random() * variations.length)]
      : variations[0];

    return NextResponse.json({ essay });
  } catch (error) {
    console.error('Essay generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay' },
      { status: 500 }
    );
  }
}

function generateEssayVariation1(student: any, scholarship: any): string {
  return `As a ${student.major} student with a ${student.gpa} GPA, I am deeply passionate about leveraging my skills to create meaningful impact in my community and beyond. The ${scholarship.name} aligns perfectly with my values and aspirations.

Throughout my academic journey, I have consistently demonstrated excellence not just in the classroom, but in applying my knowledge to real-world challenges. ${student.achievements?.split('\n')[0] || 'My achievements'} exemplify my commitment to innovation and pushing boundaries.

Leadership has been a cornerstone of my personal development. Through ${student.extracurriculars?.split('\n')[0] || 'my extracurricular activities'}, I have learned the importance of collaboration, empathy, and inspiring others to work toward common goals.

Looking forward, I am committed to using my education to create innovative solutions that benefit society, mentor future students, and give back to communities that have supported me. Thank you for considering my application.`;
}

function generateEssayVariation2(student: any, scholarship: any): string {
  return `The ${scholarship.name} represents an opportunity to further my commitment to excellence, innovation, and service. As a dedicated ${student.major} student maintaining a ${student.gpa} GPA, I have consistently pursued knowledge with passion and purpose.

My journey has been shaped by ${student.personalBackground?.substring(0, 150) || 'meaningful experiences'}, which have instilled in me the values of perseverance and community service. These experiences drive my desire to make a positive impact.

Through ${student.extracurriculars?.split('\n')[0] || 'various leadership roles'}, I have developed skills in collaboration and problem-solving. My work in ${student.achievements?.split('\n')[0] || 'key projects'} demonstrates my ability to translate ideas into action.

I am excited about the opportunity to join a community of scholars dedicated to making a difference. This scholarship would enable me to continue my educational journey while expanding my capacity to serve others.`;
}

function generateEssayVariation3(student: any, scholarship: any): string {
  return `Education has always been my pathway to creating positive change. As a ${student.major} student with a ${student.gpa} GPA, I approach learning not just as personal achievement, but as a tool for community empowerment.

${student.personalBackground?.substring(0, 200) || 'My background has taught me the value of education and opportunity.'} This perspective shapes everything I do, from my academic pursuits to my community involvement.

In ${student.extracurriculars?.split('\n')[0] || 'my extracurricular activities'}, I have found opportunities to lead, serve, and grow. My achievements in ${student.achievements?.split('\n')[0] || 'various endeavors'} reflect my commitment to excellence and innovation.

The ${scholarship.name} resonates with my values and goals. I am committed to using this opportunity to advance my education, develop my skills, and ultimately contribute to solving important challenges facing our communities. Thank you for your consideration.`;
}
