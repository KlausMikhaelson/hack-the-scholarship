/**
 * Scholarship Parser Service
 * Parses raw scholarship data and extracts structured fields, tags, and requirements
 */

/**
 * Extracts gender requirements from text
 * @param {string} text - Text to search
 * @returns {string|null} Gender requirement or null
 */
const extractGender = (text) => {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // Use word boundaries to avoid matching partial words
  // e.g., "management" shouldn't match "man", "woman" shouldn't match "man"
  
  // Check for female-specific terms first (to avoid "woman" matching "man")
  if (/\b(female|women|woman|girls?|she|her)\b/i.test(lowerText)) {
    return 'female';
  }
  
  // Check for male-specific terms (but exclude "woman", "human", "management", etc.)
  // Only match standalone words or in specific contexts
  if (/\b(male|men|boys?|he|him|his)\b/i.test(lowerText) && 
      !/\b(woman|women|human|management|many|manner|manual|manufacture)\b/i.test(lowerText)) {
    return 'male';
  }
  
  // Check for non-binary/LGBTQ+ terms
  if (/\b(non-binary|nonbinary|lgbtq|lgbt|queer|transgender|trans)\b/i.test(lowerText)) {
    return 'non-binary';
  }
  
  // Check for gender-neutral or inclusive language
  if (/\b(gender|all genders|any gender|gender inclusive)\b/i.test(lowerText)) {
    return null; // Explicitly gender-neutral, don't assign a specific gender
  }
  
  return null;
};

/**
 * Extracts student status (In-course, Entrance, etc.)
 * @param {Array} rawData - Raw data array
 * @returns {string|null}
 */
const extractStudentStatus = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return null;
  
  const statusKeywords = {
    'entrance': ['entrance', 'entering', 'first year', 'first-year', 'new student'],
    'in-course': ['in-course', 'in course', 'continuing', 'current student', 'returning'],
    'graduate': ['graduate', 'grad', 'masters', 'phd', 'doctoral'],
    'postgraduate': ['postgraduate', 'post-graduate', 'post graduate']
  };
  
  const combinedText = rawData.join(' ').toLowerCase();
  
  for (const [status, keywords] of Object.entries(statusKeywords)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return status;
    }
  }
  
  return null;
};

/**
 * Extracts student type (Domestic, International, etc.)
 * @param {Array} rawData - Raw data array
 * @returns {string|null}
 */
const extractStudentType = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return null;
  
  const combinedText = rawData.join(' ').toLowerCase();
  
  if (/(domestic|canadian|canada resident)/i.test(combinedText)) {
    return 'domestic';
  }
  if (/(international|foreign|visa student)/i.test(combinedText)) {
    return 'international';
  }
  if (/(both|all students|any student)/i.test(combinedText)) {
    return 'both';
  }
  
  return null;
};

/**
 * Extracts faculty/department information
 * @param {Array} rawData - Raw data array
 * @returns {string|null}
 */
const extractFaculty = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return null;
  
  // Common UofT faculties
  const faculties = [
    'Faculty of Arts and Science',
    'Temerty Faculty of Medicine',
    'Faculty of Applied Science and Engineering',
    'Faculty of Architecture',
    'John H. Daniels Faculty of Architecture, Landscape, and Design',
    'Rotman School of Management',
    'Faculty of Music',
    'Faculty of Kinesiology and Physical Education',
    'Faculty of Law',
    'Faculty of Information',
    'Ontario Institute for Studies in Education',
    'Faculty of Pharmacy',
    'Faculty of Dentistry',
    'Faculty of Nursing',
    'Dalla Lana School of Public Health',
    'Factor-Inwentash Faculty of Social Work'
  ];
  
  const combinedText = rawData.join(' ');
  
  for (const faculty of faculties) {
    if (combinedText.includes(faculty)) {
      return faculty;
    }
  }
  
  // Try to extract any mention of "Faculty" or "School"
  const facultyMatch = combinedText.match(/([A-Z][^.]*(?:Faculty|School)[^.]*)/);
  if (facultyMatch) {
    return facultyMatch[1].trim();
  }
  
  return null;
};

/**
 * Extracts field of study/major
 * @param {string} description - Description text
 * @returns {Array<string>} Array of fields of study
 */
const extractFieldOfStudy = (description) => {
  if (!description) return [];
  
  const fields = [];
  const commonFields = [
    'Medicine', 'Engineering', 'Business', 'Law', 'Arts', 'Science',
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Psychology', 'Economics', 'History', 'English', 'Philosophy',
    'Architecture', 'Music', 'Nursing', 'Pharmacy', 'Dentistry',
    'Education', 'Social Work', 'Public Health', 'Kinesiology'
  ];
  
  for (const field of commonFields) {
    if (new RegExp(`\\b${field}\\b`, 'i').test(description)) {
      fields.push(field);
    }
  }
  
  return fields;
};

/**
 * Extracts requirements and eligibility criteria
 * @param {Array} rawData - Raw data array
 * @param {string} description - Description text
 * @returns {Object} Requirements object
 */
const extractRequirements = (rawData, description) => {
  const requirements = {
    financialNeed: false,
    academicMerit: false,
    minimumGPA: null,
    citizenship: null,
    residency: null,
    enrollmentStatus: null,
    other: []
  };
  
  const combinedText = (rawData?.join(' ') + ' ' + (description || '')).toLowerCase();
  
  // Financial Need
  if (/(financial need|financial aid|bursary|need-based)/i.test(combinedText)) {
    requirements.financialNeed = true;
  }
  
  // Academic Merit
  if (/(academic merit|merit-based|academic excellence|scholarship|award)/i.test(combinedText)) {
    requirements.academicMerit = true;
  }
  
  // Minimum GPA
  const gpaMatch = combinedText.match(/(?:gpa|grade point average)[:\s]+(\d+\.?\d*)/i) ||
                   combinedText.match(/(\d+\.?\d*)\s*(?:gpa|grade point average)/i) ||
                   combinedText.match(/minimum[:\s]+(\d+\.?\d*)/i);
  if (gpaMatch) {
    requirements.minimumGPA = parseFloat(gpaMatch[1]);
  }
  
  // Citizenship
  if (/(canadian citizen|canadian citizenship)/i.test(combinedText)) {
    requirements.citizenship = 'canadian';
  } else if (/(permanent resident|pr status)/i.test(combinedText)) {
    requirements.citizenship = 'permanent_resident';
  }
  
  // Residency
  if (/(ontario resident|ontario residency)/i.test(combinedText)) {
    requirements.residency = 'ontario';
  } else if (/(canadian resident|canada resident)/i.test(combinedText)) {
    requirements.residency = 'canada';
  }
  
  // Enrollment Status
  if (/(full-time|full time|ft)/i.test(combinedText)) {
    requirements.enrollmentStatus = 'full-time';
  } else if (/(part-time|part time|pt)/i.test(combinedText)) {
    requirements.enrollmentStatus = 'part-time';
  }
  
  // Extract other specific requirements
  const requirementPatterns = [
    { pattern: /(disability|disabled|accessibility)/i, tag: 'disability' },
    { pattern: /(indigenous|aboriginal|first nations|metis|inuit)/i, tag: 'indigenous' },
    { pattern: /(visible minority|racialized|bipoc)/i, tag: 'racialized_minority' },
    { pattern: /(lgbtq|lgbt|queer|transgender)/i, tag: 'lgbtq' },
    { pattern: /(first generation|first-gen)/i, tag: 'first_generation' },
    { pattern: /(single parent|single mother|single father)/i, tag: 'single_parent' },
    { pattern: /(mature student|adult learner)/i, tag: 'mature_student' },
    { pattern: /(rural|remote area)/i, tag: 'rural' },
    { pattern: /(veteran|military service)/i, tag: 'veteran' }
  ];
  
  for (const { pattern, tag } of requirementPatterns) {
    if (pattern.test(combinedText)) {
      requirements.other.push(tag);
    }
  }
  
  return requirements;
};

/**
 * Extracts amount information
 * @param {string} amount - Amount string
 * @param {Array} rawData - Raw data array
 * @returns {Object} Amount object with value and type
 */
const extractAmount = (amount, rawData) => {
  const amountInfo = {
    value: null,
    currency: 'CAD',
    type: 'variable', // variable, fixed, range
    min: null,
    max: null
  };
  
  const combinedText = (amount || '') + ' ' + (rawData?.join(' ') || '');
  
  if (!amount && !combinedText.includes('variable')) {
    return amountInfo;
  }
  
  // Check for variable
  if (/variable|varies|tbd|to be determined/i.test(combinedText)) {
    amountInfo.type = 'variable';
    return amountInfo;
  }
  
  // Extract dollar amounts
  const dollarMatches = combinedText.match(/\$[\d,]+/g);
  if (dollarMatches) {
    const amounts = dollarMatches.map(m => parseInt(m.replace(/[$,]/g, '')));
    
    if (amounts.length === 1) {
      amountInfo.value = amounts[0];
      amountInfo.type = 'fixed';
    } else if (amounts.length > 1) {
      amountInfo.min = Math.min(...amounts);
      amountInfo.max = Math.max(...amounts);
      amountInfo.type = 'range';
    }
  }
  
  return amountInfo;
};

/**
 * Generates tags for easy filtering and matching
 * @param {Object} scholarship - Parsed scholarship object
 * @returns {Array<string>} Array of tags
 */
const generateTags = (scholarship) => {
  const tags = [];
  
  // Student status tags
  if (scholarship.studentStatus) {
    tags.push(`status:${scholarship.studentStatus}`);
  }
  
  // Student type tags
  if (scholarship.studentType) {
    tags.push(`type:${scholarship.studentType}`);
  }
  
  // Faculty tags
  if (scholarship.faculty) {
    tags.push(`faculty:${scholarship.faculty.replace(/\s+/g, '_').toLowerCase()}`);
  }
  
  // Field of study tags
  scholarship.fieldsOfStudy?.forEach(field => {
    tags.push(`field:${field.toLowerCase().replace(/\s+/g, '_')}`);
  });
  
  // Gender tags
  if (scholarship.gender) {
    tags.push(`gender:${scholarship.gender}`);
  }
  
  // Requirement tags
  if (scholarship.requirements.financialNeed) {
    tags.push('requirement:financial_need');
  }
  if (scholarship.requirements.academicMerit) {
    tags.push('requirement:academic_merit');
  }
  if (scholarship.requirements.minimumGPA) {
    tags.push('requirement:minimum_gpa');
  }
  
  // Other requirement tags
  scholarship.requirements.other?.forEach(req => {
    tags.push(`requirement:${req}`);
  });
  
  // Amount type tags
  if (scholarship.amountInfo?.type) {
    tags.push(`amount_type:${scholarship.amountInfo.type}`);
  }
  
  return tags;
};

/**
 * Parses a single scholarship object
 * @param {Object} rawScholarship - Raw scholarship data from scraper
 * @returns {Object} Parsed scholarship with structured fields
 */
export const parseScholarship = (rawScholarship) => {
  const {
    id,
    title,
    url,
    amount,
    deadline,
    description,
    rawData = []
  } = rawScholarship;
  
  // Extract all information
  const combinedText = [
    title,
    description,
    ...rawData
  ].filter(Boolean).join(' ');
  
  const parsed = {
    // Original fields
    id,
    title,
    url,
    deadline,
    description,
    
    // Extracted structured fields
    gender: extractGender(combinedText),
    studentStatus: extractStudentStatus(rawData),
    studentType: extractStudentType(rawData),
    faculty: extractFaculty(rawData),
    fieldsOfStudy: extractFieldOfStudy(description || combinedText),
    
    // Requirements
    requirements: extractRequirements(rawData, description),
    
    // Amount information
    amountInfo: extractAmount(amount, rawData),
    
    // Keep original amount string for display
    amount: amount,
    
    // Metadata
    scrapedAt: rawScholarship.scrapedAt,
    source: 'uoft_smartsimple'
  };
  
  // Generate tags
  parsed.tags = generateTags(parsed);
  
  return parsed;
};

/**
 * Parses an array of scholarships
 * @param {Array} scholarships - Array of raw scholarship objects
 * @returns {Array} Array of parsed scholarship objects
 */
export const parseScholarships = (scholarships) => {
  if (!Array.isArray(scholarships)) {
    throw new Error('Scholarships must be an array');
  }
  
  return scholarships.map(parseScholarship);
};

/**
 * Parses scholarships from JSON file and saves parsed version
 * @param {string} inputPath - Path to input JSON file
 * @param {string} outputPath - Path to output JSON file (optional)
 * @returns {Promise<Object>} Parsed scholarships data
 */
export const parseScholarshipsFromFile = async (inputPath, outputPath = null) => {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Read input file
  const fileContent = await fs.readFile(inputPath, 'utf-8');
  const data = JSON.parse(fileContent);
  
  // Parse scholarships
  const parsedScholarships = parseScholarships(data.scholarships || []);
  
  // Create output object
  const output = {
    metadata: {
      ...data.metadata,
      parsedAt: new Date().toISOString(),
      totalParsed: parsedScholarships.length
    },
    scholarships: parsedScholarships
  };
  
  // Save if output path provided
  if (outputPath) {
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  }
  
  return output;
};

