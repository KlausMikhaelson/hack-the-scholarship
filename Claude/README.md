# Scholarship Essay Generator

An AI-powered application that generates personalized scholarship essays by analyzing scholarship requirements and student profiles using Claude AI.

## 🎯 Overview

This system uses multi-step AI analysis to:
1. Analyze scholarship values, themes, and requirements
2. Create a weighted scoring system based on scholarship criteria
3. Evaluate student strengths against scholarship requirements
4. Generate a customized, high-quality scholarship essay

The generated essays are strategically aligned with what scholarship committees value, incorporating key themes and patterns from successful applications.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- npm or yarn
- Anthropic API key (Claude)

### Installation

```bash
# Install dependencies
npm install

# Create .env file with your API key
echo "CLAUDE_API_KEY=your_api_key_here" > .env
```

### Running the Server

```bash
# Compile TypeScript
npx tsc

# Start the server
node dist/server.js
```

The server will start on `http://localhost:3000` (or the port specified in your `PORT` environment variable).

### Testing

```bash
# Quick health check
node quick-test.js

# Comprehensive essay generation test
node test-essay-generation.js
```

---

## 📡 API Endpoints

### 1. POST `/api/scholarship-essay`

Generates a complete scholarship essay with analysis and strategic explanation.

#### Request Format

```json
{
  "scholarshipData": {
    "title": "string",
    "description": "string",
    "studentStatus": "string (e.g., 'Undergraduate', 'Graduate')",
    "studentType": "string (e.g., 'Full-time', 'Part-time')",
    "faculty": "string (e.g., 'Engineering', 'Business')",
    "fieldsOfStudy": ["string", "string"],
    "requirements": {
      "financialNeed": boolean,
      "academicMerit": boolean,
      "minimumGPA": number,
      "enrollmentStatus": "string",
      "other": "string (any additional requirements)"
    }
  },
  "studentData": {
    "name": "string",
    "gpa": number,
    "major": "string",
    "extracurriculars": ["string", "string"],
    "achievements": ["string", "string"],
    "personalBackground": "string",
    "writingSample": "string (optional)"
  },
  "essayRequirements": "string (optional, e.g., '500-750 words')",
  "winnerEssay": "string (optional, example of winning essay)"
}
```

#### Input Field Details

**Scholarship Data:**
- `title` - Name of the scholarship
- `description` - What the scholarship is for
- `studentStatus` - Level (Undergraduate, Graduate, etc.)
- `studentType` - Enrollment type (Full-time, Part-time, etc.)
- `faculty` - Academic faculty or department
- `fieldsOfStudy` - Array of eligible fields (e.g., ["Computer Science", "Engineering"])
- `requirements.financialNeed` - Whether financial need is considered
- `requirements.academicMerit` - Whether academic performance matters
- `requirements.minimumGPA` - Minimum GPA requirement
- `requirements.enrollmentStatus` - Required enrollment status
- `requirements.other` - Any other specific requirements

**Student Data:**
- `name` - Student's full name
- `gpa` - Current GPA (e.g., 3.8)
- `major` - Field of study
- `extracurriculars` - List of activities, clubs, leadership roles
- `achievements` - List of awards, honors, recognitions
- `personalBackground` - Background story, challenges overcome, motivation
- `writingSample` - (Optional) Previous writing sample to match style

**Additional Parameters:**
- `essayRequirements` - (Optional) Word count or specific requirements
- `winnerEssay` - (Optional) Example of a winning essay to learn from

#### Response Format

```json
{
  "success": true,
  "data": {
    "scholarshipAnalysis": {
      "values": ["string"],
      "themes": ["string"],
      "keywords": ["string"],
      "emphasis": ["string"],
      "patterns": ["string"],
      "weights": {
        "value_name": number
      }
    },
    "profileWeights": {
      "criteria": [
        {
          "name": "string",
          "weight": number,
          "description": "string"
        }
      ],
      "strengthCategories": ["string"],
      "scoringRubric": {
        "criterion_name": "string"
      }
    },
    "studentEvaluation": {
      "scores": {
        "criterion_name": number
      },
      "totalScore": number,
      "strongMatches": ["string"],
      "weakMatches": ["string"],
      "standoutQualities": ["string"]
    },
    "essay": {
      "essay": "string (the complete essay text)",
      "wordCount": number,
      "explanation": "string (strategic explanation of essay choices)",
      "valueAlignment": {
        "value_name": "string (how essay addresses this value)"
      },
      "keywordUsage": ["string (keywords used in essay)"]
    }
  }
}
```

#### Output Field Details

**Scholarship Analysis:**
- `values` - Core values the scholarship emphasizes
- `themes` - Major themes in scholarship description
- `keywords` - Important keywords to include in essay
- `emphasis` - Areas the scholarship emphasizes
- `patterns` - Patterns found in successful applications
- `weights` - Importance score for each value (0-10)

**Profile Weights:**
- `criteria` - Evaluation criteria with weights
- `strengthCategories` - Categories of student strengths (academic, leadership, service, etc.)
- `scoringRubric` - How each criterion is evaluated

**Student Evaluation:**
- `scores` - Score for each evaluation criterion
- `totalScore` - Overall score out of 100
- `strongMatches` - Areas where student excels
- `weakMatches` - Areas needing improvement
- `standoutQualities` - Unique aspects that stand out

**Generated Essay:**
- `essay` - The complete, ready-to-submit essay
- `wordCount` - Number of words in the essay
- `explanation` - Detailed explanation of strategic choices made
- `valueAlignment` - How each scholarship value is addressed
- `keywordUsage` - List of keywords naturally integrated

#### Example Request

```bash
curl -X POST http://localhost:3000/api/scholarship-essay \
  -H "Content-Type: application/json" \
  -d '{
    "scholarshipData": {
      "title": "Excellence in STEM Scholarship",
      "description": "For students pursuing degrees in Science, Technology, Engineering, or Mathematics",
      "studentStatus": "Undergraduate",
      "studentType": "Full-time",
      "faculty": "Engineering",
      "fieldsOfStudy": ["Computer Science", "Engineering", "Physics"],
      "requirements": {
        "financialNeed": true,
        "academicMerit": true,
        "minimumGPA": 3.5,
        "enrollmentStatus": "Full-time",
        "other": "Demonstrated leadership in community service"
      }
    },
    "studentData": {
      "name": "John Doe",
      "gpa": 3.8,
      "major": "Computer Science",
      "extracurriculars": ["Robotics Club President", "Volunteer Tutor"],
      "achievements": ["Dean'\''s List", "National Merit Scholar"],
      "personalBackground": "First-generation college student from low-income family"
    },
    "essayRequirements": "500-750 words",
    "winnerEssay": "Previous winning essay text here..."
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "scholarshipAnalysis": {
      "values": ["Academic Excellence", "Leadership", "Community Service", "Innovation"],
      "themes": ["STEM Education", "Social Impact", "Overcoming Challenges"],
      "keywords": ["innovation", "leadership", "community", "technology", "impact"],
      "emphasis": ["Technical Skills", "Leadership Qualities", "Service to Community"],
      "patterns": ["Personal Story", "Specific Examples", "Future Vision"],
      "weights": {
        "Academic Excellence": 8,
        "Leadership": 9,
        "Community Service": 8
      }
    },
    "profileWeights": {
      "criteria": [
        {
          "name": "Academic Achievement",
          "weight": 8,
          "description": "GPA and academic performance"
        },
        {
          "name": "Leadership Experience",
          "weight": 9,
          "description": "Leadership roles and impact"
        }
      ],
      "strengthCategories": ["academic", "leadership", "service"],
      "scoringRubric": {
        "Academic Achievement": "Evaluate GPA, honors, and academic accomplishments",
        "Leadership Experience": "Assess leadership roles and demonstrated impact"
      }
    },
    "studentEvaluation": {
      "scores": {
        "Academic Achievement": 9,
        "Leadership Experience": 8.5
      },
      "totalScore": 85.3,
      "strongMatches": ["Academic Excellence", "Leadership in Robotics"],
      "weakMatches": ["Community Service Hours"],
      "standoutQualities": ["First-generation student", "Robotics Club President"]
    },
    "essay": {
      "essay": "When I first assembled my first robot in middle school...",
      "wordCount": 687,
      "explanation": "The essay strategically opens with a personal story about robotics to immediately connect with the scholarship's STEM focus...",
      "valueAlignment": {
        "Academic Excellence": "Demonstrated through Dean's List mention and GPA",
        "Leadership": "Highlighted through Robotics Club President role"
      },
      "keywordUsage": ["innovation", "leadership", "community", "technology", "impact"]
    }
  }
}
```

---

### 2. GET `/api/health`

Health check endpoint to verify the server is running.

#### Request

```bash
curl http://localhost:3000/api/health
```

#### Response

```json
{
  "status": "Server is running"
}
```

---

## ⚠️ Error Handling

### Missing Required Fields

**Status Code**: 400

```json
{
  "error": "Missing required fields: scholarshipData and studentData"
}
```

### Server Error

**Status Code**: 500

```json
{
  "error": "Failed to process scholarship application",
  "message": "Detailed error message here"
}
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Server not responding | Make sure server is running: `node dist/server.js` |
| API key error | Check `.env` file has valid `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY` |
| Timeout error | Essay generation takes 30-90 seconds; increase timeout if needed |
| Invalid JSON | Ensure request body is valid JSON with all required fields |

---

## 📊 Processing Workflow

The system follows a 4-step workflow:

```
┌─────────────────────────────────────────┐
│  1. SCHOLARSHIP ANALYSIS                │
│  - Extract values, themes, keywords     │
│  - Identify patterns in winning essays  │
│  - Assign importance weights            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  2. PROFILE WEIGHTS GENERATION          │
│  - Create evaluation criteria           │
│  - Define scoring rubric                │
│  - Identify strength categories         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  3. STUDENT EVALUATION                  │
│  - Score student against criteria       │
│  - Identify strengths and weaknesses    │
│  - Calculate total score (0-100)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  4. ESSAY GENERATION                    │
│  - Write personalized essay             │
│  - Align with scholarship values        │
│  - Integrate keywords naturally         │
│  - Provide strategic explanation        │
└─────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Key (required)
CLAUDE_API_KEY=your_anthropic_api_key_here

# Server Port (optional, defaults to 3000)
PORT=3000
```

### TypeScript Configuration

The project uses TypeScript with the following settings:
- Target: ES2020
- Module: Node16
- Output Directory: `./dist`

---

## 📝 Example Usage

### JavaScript/Node.js

```javascript
import axios from "axios";

const response = await axios.post("http://localhost:3000/api/scholarship-essay", {
  scholarshipData: {
    title: "STEM Excellence Award",
    description: "For outstanding STEM students",
    studentStatus: "Undergraduate",
    studentType: "Full-time",
    faculty: "Engineering",
    fieldsOfStudy: ["Computer Science", "Engineering"],
    requirements: {
      financialNeed: true,
      academicMerit: true,
      minimumGPA: 3.5,
      enrollmentStatus: "Full-time",
      other: "Leadership experience required"
    }
  },
  studentData: {
    name: "Jane Smith",
    gpa: 3.9,
    major: "Computer Science",
    extracurriculars: ["Math Club President", "Volunteer Mentor"],
    achievements: ["Summa Cum Laude", "National Merit Scholar"],
    personalBackground: "Immigrant student, first in family to attend college"
  },
  essayRequirements: "500-750 words"
});

console.log("Generated Essay:");
console.log(response.data.data.essay.essay);
console.log("\nStrategic Explanation:");
console.log(response.data.data.essay.explanation);
```

### Python

```python
import requests
import json

url = "http://localhost:3000/api/scholarship-essay"

payload = {
    "scholarshipData": {
        "title": "STEM Excellence Award",
        "description": "For outstanding STEM students",
        "studentStatus": "Undergraduate",
        "studentType": "Full-time",
        "faculty": "Engineering",
        "fieldsOfStudy": ["Computer Science", "Engineering"],
        "requirements": {
            "financialNeed": True,
            "academicMerit": True,
            "minimumGPA": 3.5,
            "enrollmentStatus": "Full-time",
            "other": "Leadership experience required"
        }
    },
    "studentData": {
        "name": "Jane Smith",
        "gpa": 3.9,
        "major": "Computer Science",
        "extracurriculars": ["Math Club President", "Volunteer Mentor"],
        "achievements": ["Summa Cum Laude", "National Merit Scholar"],
        "personalBackground": "Immigrant student, first in family to attend college"
    },
    "essayRequirements": "500-750 words"
}

response = requests.post(url, json=payload)
data = response.json()

print("Generated Essay:")
print(data["data"]["essay"]["essay"])
print("\nWord Count:", data["data"]["essay"]["wordCount"])
```

---

## 📈 Performance

- **Processing Time**: 30-90 seconds per request (depends on API response time)
- **Essay Length**: Typically 500-1000 words
- **Response Size**: 10-50 KB (includes analysis, evaluation, and essay)
- **Concurrent Requests**: Limited by API rate limits

---

## 🧪 Testing

### Run Tests

```bash
# Start server in one terminal
node dist/server.js

# Run tests in another terminal
node test-essay-generation.js
```

### Test Coverage

- ✅ Server health check
- ✅ Essay generation with complete data
- ✅ Response structure validation
- ✅ Error handling for missing fields
- ✅ Scholarship analysis
- ✅ Student evaluation
- ✅ Essay quality and alignment

---

## 📦 Dependencies

- **express** - Web server framework
- **dotenv** - Environment variable management
- **@langchain/anthropic** - Claude AI integration
- **@langchain/core** - LangChain core utilities
- **typescript** - TypeScript compiler
- **axios** - HTTP client (for testing)

---

## 🔐 Security

- API keys are stored in `.env` and should never be committed to version control
- `.env` is included in `.gitignore`
- All API calls use HTTPS (when deployed)
- Input validation on all endpoints

---

## 🐛 Troubleshooting

### Server won't start

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Use a different port
PORT=3001 node dist/server.js
```

### API key errors

```bash
# Verify API key is set
echo $CLAUDE_API_KEY

# Check .env file exists and has correct format
cat .env
```

### Timeout errors

- Increase axios timeout in test files
- Check internet connection
- Verify API key is valid and has quota

### TypeScript compilation errors

```bash
# Clean and rebuild
rm -rf dist
npx tsc
```

---

## 📄 License

This project uses the Anthropic Claude API. See Anthropic's terms of service for usage rights.

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test output: `node test-essay-generation.js`
3. Check server logs for error messages
4. Verify all environment variables are set correctly

---

## 📚 Additional Resources

- [Anthropic Claude API Documentation](https://docs.anthropic.com/)
- [LangChain Documentation](https://js.langchain.com/)
- [Express.js Documentation](https://expressjs.com/)

---

**Last Updated**: November 2025  
**Version**: 1.0.0
