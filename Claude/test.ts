import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Test data
const testScholarshipData = {
  title: "Excellence in STEM Scholarship",
  description: "For students pursuing degrees in Science, Technology, Engineering, or Mathematics",
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
  writingSample: "I have always been passionate about solving real-world problems through technology..."
};

const testEssayRequirements = "500-750 words, focus on leadership and community impact";

const testWinnerEssay = `
This scholarship has been transformative for students who demonstrate both academic excellence and 
a commitment to using their education for social good. Previous winners have shown how STEM knowledge 
can be applied to address community challenges. We value authenticity, specific examples, and a clear 
vision for how the student will contribute to society.
`;

async function runTests() {
  console.log("🧪 Starting Server Tests...\n");

  try {
    // Test 1: Health Check
    console.log("Test 1: Health Check");
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log("✅ Health check passed:", healthResponse.data);
    } catch (error) {
      console.log("❌ Health check failed - Server may not be running");
      console.log("   Make sure to run: node dist/server.js");
      return;
    }

    // Test 2: Scholarship Essay Generation
    console.log("\nTest 2: Scholarship Essay Generation");
    console.log("Sending request to /api/scholarship-essay...");
    
    const essayResponse = await axios.post(
      `${BASE_URL}/api/scholarship-essay`,
      {
        scholarshipData: testScholarshipData,
        studentData: testStudentData,
        essayRequirements: testEssayRequirements,
        winnerEssay: testWinnerEssay
      },
      { timeout: 60000 } // 60 second timeout for API calls
    );

    if (essayResponse.data.success) {
      console.log("✅ Essay generation successful!");
      console.log("\nGenerated Essay:");
      console.log("---");
      console.log(essayResponse.data.data.essay.essay);
      console.log("---");
      console.log(`\nWord Count: ${essayResponse.data.data.essay.wordCount}`);
      console.log("\nStrategic Explanation:");
      console.log(essayResponse.data.data.essay.explanation);
    } else {
      console.log("❌ Essay generation failed");
    }

    // Test 3: Missing Required Fields
    console.log("\n\nTest 3: Error Handling - Missing Required Fields");
    try {
      await axios.post(`${BASE_URL}/api/scholarship-essay`, {
        scholarshipData: testScholarshipData
        // Missing studentData
      });
      console.log("❌ Should have returned an error");
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log("✅ Correctly rejected request with missing fields");
        console.log("   Error:", error.response.data.error);
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    console.log("\n\n✅ All tests completed!");

  } catch (error: any) {
    console.error("❌ Test failed with error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.message) {
      console.error("Message:", error.message);
    } else {
      console.error(error);
    }
  }
}

runTests();
