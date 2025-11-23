import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Test data
const testScholarshipData = {
  title: "Excellence in STEM Scholarship",
  description: "For students pursuing degrees in Science, Technology, Engineering, or Mathematics with demonstrated leadership and community impact",
  studentStatus: "Undergraduate",
  studentType: "Full-time",
  faculty: "Engineering",
  fieldsOfStudy: ["Computer Science", "Engineering", "Physics"],
  requirements: {
    financialNeed: true,
    academicMerit: true,
    minimumGPA: 3.5,
    enrollmentStatus: "Full-time",
    other: "Demonstrated leadership in community service"
  }
};

const testStudentData = {
  name: "John Doe",
  gpa: 3.8,
  major: "Computer Science",
  extracurriculars: ["Robotics Club President", "Volunteer Tutor", "Hackathon Participant"],
  achievements: ["Dean's List", "National Merit Scholar", "Published Research Paper"],
  personalBackground: "First-generation college student from low-income family, overcame adversity through education",
  writingSample: "I have always been passionate about solving real-world problems through technology and helping others achieve their goals."
};

const testEssayRequirements = "500-750 words, focus on leadership and community impact";

const testWinnerEssay = `
This scholarship has been transformative for students who demonstrate both academic excellence and 
a commitment to using their education for social good. Previous winners have shown how STEM knowledge 
can be applied to address community challenges. We value authenticity, specific examples, and a clear 
vision for how the student will contribute to society.
`;

async function testEssayGeneration() {
  console.log("=" .repeat(80));
  console.log("🧪 SCHOLARSHIP ESSAY GENERATION TEST");
  console.log("=" .repeat(80));
  console.log(`\nTest Start Time: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Verify server is running
    console.log("Step 1: Checking server health...");
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
      console.log("✅ Server is running");
      console.log(`   Response: ${JSON.stringify(healthResponse.data)}\n`);
    } catch (error) {
      console.error("❌ Server is not running!");
      console.error(`   Error: ${error.message}`);
      console.error("   Please start the server with: node dist/server.js\n");
      return;
    }

    // Step 2: Send essay generation request
    console.log("Step 2: Sending essay generation request...");
    console.log(`   Scholarship: ${testScholarshipData.title}`);
    console.log(`   Student: ${testStudentData.name}`);
    console.log(`   GPA: ${testStudentData.gpa}`);
    console.log(`   Major: ${testStudentData.major}\n`);

    const startTime = Date.now();
    console.log("⏳ Processing request (this may take 30-60 seconds)...\n");

    const essayResponse = await axios.post(
      `${BASE_URL}/api/scholarship-essay`,
      {
        scholarshipData: testScholarshipData,
        studentData: testStudentData,
        essayRequirements: testEssayRequirements,
        winnerEssay: testWinnerEssay
      },
      { timeout: 120000 } // 2 minute timeout
    );

    console.log(JSON.stringify(essayResponse.data, null, 2))
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Request completed in ${processingTime} seconds\n`);

    // Step 3: Validate response structure
    console.log("Step 3: Validating response structure...");
    if (!essayResponse.data.success) {
      console.error("❌ Response indicates failure");
      console.error(`   Data: ${JSON.stringify(essayResponse.data)}\n`);
      return;
    }

    const { data } = essayResponse.data;

    // Validate all required fields
    const requiredFields = ["scholarshipAnalysis", "profileWeights", "studentEvaluation", "essay"];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(", ")}\n`);
      return;
    }

    console.log("✅ Response structure is valid\n");

    // Step 4: Display scholarship analysis
    console.log("Step 4: Scholarship Analysis");
    console.log("-" .repeat(80));
    const analysis = data.scholarshipAnalysis;
    console.log(`Values: ${analysis.values?.join(", ") || "N/A"}`);
    console.log(`Themes: ${analysis.themes?.join(", ") || "N/A"}`);
    console.log(`Keywords: ${analysis.keywords?.join(", ") || "N/A"}`);
    console.log(`Emphasis: ${analysis.emphasis?.join(", ") || "N/A"}`);
    console.log();

    // Step 5: Display profile weights
    console.log("Step 5: Profile Weights");
    console.log("-" .repeat(80));
    const weights = data.profileWeights;
    if (weights.criteria) {
      console.log("Evaluation Criteria:");
      weights.criteria.forEach((criterion, index) => {
        console.log(`  ${index + 1}. ${criterion.name || criterion}: Weight ${criterion.weight || "N/A"}`);
      });
    }
    console.log();

    // Step 6: Display student evaluation
    console.log("Step 6: Student Evaluation");
    console.log("-" .repeat(80));
    const evaluation = data.studentEvaluation;
    console.log(`Total Score: ${evaluation.totalScore}/100`);
    if (evaluation.strongMatches) {
      console.log(`Strong Matches: ${evaluation.strongMatches.join(", ")}`);
    }
    if (evaluation.weakMatches) {
      console.log(`Areas for Improvement: ${evaluation.weakMatches.join(", ")}`);
    }
    if (evaluation.standoutQualities) {
      console.log(`Standout Qualities: ${evaluation.standoutQualities.join(", ")}`);
    }
    console.log();

    // Step 7: Display generated essay
    console.log("Step 7: Generated Essay");
    console.log("=" .repeat(80));
    const essay = data.essay;
    console.log(`\nWord Count: ${essay.wordCount} words`);
    console.log(`\n${essay.essay}\n`);
    console.log("=" .repeat(80));

    // Step 8: Display essay explanation
    console.log("\nStep 8: Strategic Explanation");
    console.log("-" .repeat(80));
    console.log(essay.explanation);
    console.log();

    // Step 9: Display keyword usage
    console.log("Step 9: Keyword Usage");
    console.log("-" .repeat(80));
    if (essay.keywordUsage && Array.isArray(essay.keywordUsage)) {
      essay.keywordUsage.forEach((keyword, index) => {
        console.log(`  ${index + 1}. ${keyword}`);
      });
    }
    console.log();

    // Final summary
    console.log("=" .repeat(80));
    console.log("✅ TEST PASSED - Essay generation completed successfully!");
    console.log("=" .repeat(80));
    console.log(`\nTest End Time: ${new Date().toISOString()}`);
    console.log(`Total Processing Time: ${processingTime} seconds\n`);

  } catch (error) {
    console.error("\n" + "=" .repeat(80));
    console.error("❌ TEST FAILED - Error occurred");
    console.error("=" .repeat(80));

    if (error.response) {
      console.error("\n📊 HTTP Response Error:");
      console.error(`   Status Code: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      console.error(`   Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error("\n📡 Request Error (No Response):");
      console.error(`   Message: ${error.message}`);
      console.error("   The server may not be responding. Check if it's running.");
    } else {
      console.error("\n⚠️ Error:");
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }

    console.error("\n" + "=" .repeat(80));
    console.error(`Test End Time: ${new Date().toISOString()}\n`);
  }
}

testEssayGeneration();
