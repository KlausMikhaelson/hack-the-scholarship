import { parseScholarshipsFromFile } from '../services/scholarship-parser.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse scholarships from JSON file
 * Run with: node src/scripts/parse-scholarships.js
 */
(async () => {
  try {
    const inputPath = path.join(__dirname, '../../data/scholarships.json');
    const outputPath = path.join(__dirname, '../../data/scholarships-parsed.json');
    
    console.log('🔄 Parsing scholarships...\n');
    console.log(`📂 Input: ${inputPath}`);
    
    const result = await parseScholarshipsFromFile(inputPath, outputPath);
    
    console.log('\n✅ Parsing completed successfully!');
    console.log(`📊 Total scholarships parsed: ${result.metadata.totalParsed}`);
    console.log(`💾 Parsed data saved to: ${outputPath}`);
    
    // Show sample of parsed data
    if (result.scholarships.length > 0) {
      console.log('\n📋 Sample parsed scholarship:');
      const sample = result.scholarships[0];
      console.log(JSON.stringify({
        title: sample.title,
        tags: sample.tags,
        requirements: sample.requirements,
        studentType: sample.studentType,
        studentStatus: sample.studentStatus,
        faculty: sample.faculty
      }, null, 2));
    }
  } catch (error) {
    console.error('\n❌ Parsing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

