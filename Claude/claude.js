/**
 * Main workflow function to process a scholarship application
 * This function takes in the necessary information and runs it through the
 * 5-step workflow to generate a customized scholarship essay and strategic
 * recommendations for improvement.
 * 
 * @param {string} scholarshipInfo - Details about the scholarship
 * @param {string} winnerEssay - Optional winning essay for analysis
 * @param {Object} studentProfile - The student's profile information
 * @param {string} essayRequirements - Specific requirements for the essay
 * @returns {Object} The generated essay and strategic analysis
 */
async function processScholarshipApplication(
  scholarshipInfo,
  winnerEssay = "",
  studentProfile,
  essayRequirements
) {
  try {
    console.log("Step 1: Analyzing scholarship...");
    const scholarshipAnalysisRaw = await analysisChain.invoke({
      scholarshipInfo,
      winnerEssay,
    });
    const scholarshipAnalysis = JSON.parse(scholarshipAnalysisRaw);
    console.log("✓ Analysis complete");

    console.log("\nStep 2: Generating profile weights...");
    const profileWeightsRaw = await weightsChain.invoke({
      scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
    });
    const profileWeights = JSON.parse(profileWeightsRaw);
    console.log("✓ Weights generated");

    console.log("\nStep 3: Evaluating student strengths...");
    const studentEvaluationRaw = await evaluationChain.invoke({
      studentProfile,
      profileWeights: JSON.stringify(profileWeights),
    });
    const studentEvaluation = JSON.parse(studentEvaluationRaw);
    console.log("✓ Evaluation complete");
    console.log(`Total Score: ${studentEvaluation.totalScore}/100`);

    console.log("\nStep 4: Generating recommendations...");
    const recommendationsRaw = await recommendationsChain.invoke({
      studentEvaluation: JSON.stringify(studentEvaluation),
      scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
    });
    const recommendations = JSON.parse(recommendationsRaw);
    console.log("✓ Top 5 recommendations ready");

    console.log("\nStep 5: Generating aligned essay...");
    const essayOutputRaw = await essayChain.invoke({
      studentProfile,
      scholarshipAnalysis: JSON.stringify(scholarshipAnalysis),
      studentEvaluation: JSON.stringify(studentEvaluation),
      essayRequirements,
    });
    const essayOutput = JSON.parse(essayOutputRaw);
    console.log("✓ Essay generated");

    return {
      scholarshipAnalysis,
      profileWeights,
      studentEvaluation,
      recommendations,
      essay: essayOutput,
    };
  } catch (error) {
    console.error("Error in workflow:", error);
    throw error;
  }
}

// Example usage
async function main() {
  const scholarshipInfo = `
    Gates Scholarship Program
    - For outstanding minority students with significant financial need
    - Values: Leadership, perseverance, community service, academic excellence
    - Seeks students who will make positive change in their communities
    - Full scholarship covering tuition, fees, room, and board
  `;

  const winnerEssay = `
    Growing up in a low-income neighborhood, I witnessed firsthand how lack of 
    resources created barriers to education. Instead of accepting this reality, 
    I founded a free tutoring program that has served over 200 students. Through 
    this experience, I learned that true leadership means empowering others...
  `;

  const studentProfile = `
    Name: Maria Rodriguez
    GPA: 3.9
    Activities: 
    - President of Student Council
    - Volunteer at local food bank (300+ hours)
    - Founded coding club for underrepresented students
    - Part-time job to support family (20 hrs/week)
    Achievements:
    - National Honor Society
    - Regional science fair winner
    - First-generation college student
    Goals: Computer Science major, create tech solutions for underserved communities
  `;

  const wordCount = "500-750 words";

  const result = await processScholarshipApplication(
    scholarshipInfo,
    winnerEssay,
    studentProfile,
    wordCount,
  );

  console.log("\n========== RESULTS ==========");
  console.log("\n--- Scholarship Analysis ---");
  console.log(JSON.stringify(result.scholarshipAnalysis, null, 2));

  console.log("\n--- Student Score ---");
  console.log(`Total: ${result.studentEvaluation.totalScore}/100`);
  console.log("Strong Matches:", result.studentEvaluation.strongMatches);

  console.log("\n--- Top 5 Recommendations ---");
  result.recommendations.recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. ${rec.title} (${rec.priority} priority)`);
    console.log(`   ${rec.description}`);
  });

  console.log("\n--- Generated Essay ---");
  console.log(result.essay.essay);
  console.log(`\nWord Count: ${result.essay.wordCount}`);

  console.log("\n--- Strategic Explanation ---");
  console.log(result.essay.explanation);
}

// Run the example
main().catch(console.error);