import { NextRequest, NextResponse } from 'next/server';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// Helper to parse JSON responses with robust error handling
function parseJSON(jsonString: string): any {
  let cleaned = jsonString.trim();
  
  // Remove markdown code blocks
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/i, "").replace(/\n?```$/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  
  // Try to extract JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Try to fix common JSON issues
  try {
    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Try parsing
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Attempted to parse:", cleaned.substring(0, 500));
    
    // Try to extract just the fields array if the outer object is malformed
    try {
      const fieldsMatch = cleaned.match(/"fields"\s*:\s*\[[\s\S]*\]/);
      if (fieldsMatch) {
        const fieldsJson = `{${fieldsMatch[0]}}`;
        const parsed = JSON.parse(fieldsJson);
        return { fields: parsed.fields || [] };
      }
    } catch (e) {
      // Ignore
    }
    
    // Try to find and parse individual field objects
    try {
      const fieldMatches = cleaned.match(/\{[^{}]*"selector"[^{}]*\}/g);
      if (fieldMatches && fieldMatches.length > 0) {
        const fields = fieldMatches
          .map(fieldStr => {
            try {
              // Fix common issues in individual field objects
              let fixed = fieldStr
                .replace(/,(\s*[}])/g, '$1') // Remove trailing commas
                .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Add quotes to keys if missing
              
              return JSON.parse(fixed);
            } catch (e) {
              return null;
            }
          })
          .filter(f => f !== null);
        
        if (fields.length > 0) {
          return { fields };
        }
      }
    } catch (e) {
      // Ignore
    }
    
    // If all parsing attempts fail, return empty fields array
    console.warn("Could not parse JSON response, returning empty fields array");
    return { fields: [] };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if this is an extension request
    const isExtensionRequest = request.headers.get('x-extension-request') === 'true';
    let userId: string | null = null;
    
    if (isExtensionRequest) {
      // Extension requests use email/clerkId stored in localStorage
      const extensionClerkId = request.headers.get('x-extension-user-id');
      const extensionEmail = request.headers.get('x-extension-user-email');
      
      if (!extensionClerkId && !extensionEmail) {
        return NextResponse.json(
          { error: 'Unauthorized - missing user identifier' },
          { status: 401 }
        );
      }
      
      // Look up user by clerkId or email
      const { prisma } = await import('@/lib/prisma');
      
      let user = null;
      if (extensionClerkId) {
        user = await prisma.user.findUnique({
          where: { clerkId: extensionClerkId },
          include: { profile: true }
        });
      }
      
      if (!user && extensionEmail) {
        user = await prisma.user.findFirst({
          where: { email: extensionEmail },
          include: { profile: true }
        });
      }
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found. Please complete sign up first.' },
          { status: 404 }
        );
      }
      
      userId = user.clerkId;
    } else {
      // Web requests use Bearer token or Clerk session
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(
              Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
            );
            userId = payload.sub || null;
          }
        } catch (error) {
          console.error('Token decode error:', error);
        }
      }
      
      // Fall back to Clerk auth() for web requests
      if (!userId) {
        const authResult = await auth();
        userId = authResult.userId;
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { formHTML, userData } = body;

    if (!formHTML || !userData) {
      return NextResponse.json(
        { error: 'Missing formHTML or userData' },
        { status: 400 }
      );
    }
    
    // For extension requests, fetch user profile data from database
    let profileData = userData;
    if (isExtensionRequest && userId) {
      const { prisma } = await import('@/lib/prisma');
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { profile: true }
      });
      
      if (user) {
        // Merge database profile with provided userData
        profileData = {
          name: user.name || userData.name || '',
          email: user.email || userData.email || '',
          firstName: user.firstName || userData.firstName || '',
          lastName: user.lastName || userData.lastName || '',
          gpa: user.profile?.gpaString || user.profile?.gpa?.toString() || userData.gpa || '',
          major: user.profile?.major || userData.major || '',
          extracurriculars: user.profile?.extracurriculars || userData.extracurriculars || '',
          achievements: user.profile?.achievements || userData.achievements || '',
          personalBackground: user.profile?.personalBackground || userData.personalBackground || '',
          writingSample: user.profile?.writingSample || userData.writingSample || ''
        };
      }
    }

    // Initialize Claude
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Use Claude Sonnet 4 - same model as other endpoints
    const model = new ChatAnthropic({
      modelName: 'claude-sonnet-4-20250514',
      temperature: 0.3,
      maxTokens: 4096,
      anthropicApiKey: apiKey,
    });

    // Create prompt for form HTML analysis
    const prompt = `You are analyzing a scholarship application form HTML. Your task is to identify form fields and determine what values from the user's profile should be filled in each field.

User Profile Data:
${JSON.stringify(profileData, null, 2)}

Form HTML:
${formHTML}

Analyze the form HTML and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just pure JSON):
{
  "fields": [
    {
      "selector": "CSS selector to find the field (e.g., '#email', '[name=\\"firstName\\"]', 'input[type=\\"email\\"]')",
      "id": "field id if available",
      "name": "field name if available",
      "label": "field label text",
      "fieldType": "text|email|textarea|select|number",
      "value": "the value to fill from user profile",
      "confidence": 0.9
    }
  ]
}

Match user profile fields to form fields:
- name/fullName -> Full Name fields
- firstName -> First Name fields
- lastName -> Last Name fields
- email -> Email fields
- gpa -> GPA/Grade Point Average fields
- major -> Major/Field of Study fields
- extracurriculars -> Extracurricular Activities fields
- achievements -> Awards/Achievements fields
- personalBackground or writingSample -> Essay/Personal Statement/Background fields (PRIORITY: Use personalBackground if available, otherwise writingSample. For essay fields, provide a well-written personal statement that combines the user's background, achievements, and goals. If the field asks for a personal statement or essay, create a compelling narrative that highlights the user's strengths and experiences.)

CRITICAL FOR ESSAY/PERSONAL STATEMENT FIELDS:
- If you find fields labeled "essay", "personal statement", "personal background", "statement", "why", "describe yourself", or similar:
  - Create a well-written personal statement (300-500 words) that:
    * Opens with a compelling hook or personal story
    * Incorporates the user's personalBackground
    * Highlights their achievements and extracurriculars
    * Shows their goals and aspirations
    * Demonstrates why they deserve the scholarship
  - Use the user's writingSample as a style reference for tone and voice
  - Make it authentic and specific, not generic

IMPORTANT: 
- Return ONLY valid JSON, no markdown code blocks, no explanations before or after
- Escape all quotes in string values (use \\" for quotes inside strings)
- Escape newlines in essay text with \\n
- Do not include trailing commas
- Use precise CSS selectors based on the HTML structure (id, name, class, type attributes)
- Only include fields you can confidently identify and match
- For essay fields, ensure the value is a complete, well-written personal statement
- If no fields match, return: {"fields": []}`;

    // Create HumanMessage with text content only (no image needed)
    const message = new HumanMessage({
      content: prompt
    });

    // Call Claude with the form HTML
    const response = await model.invoke([message]);
    
    // Extract text content from response
    let responseText = '';
    if (typeof response.content === 'string') {
      responseText = response.content;
    } else if (Array.isArray(response.content)) {
      // Handle array of content blocks
      responseText = response.content
        .map((block: any) => {
          if (typeof block === 'string') return block;
          if (block.type === 'text') return block.text;
          return '';
        })
        .join('');
    } else {
      responseText = String(response.content);
    }
    
    const analysis = parseJSON(responseText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Form analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze form', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

