import { scrapeAndSave } from '../services/scraper.service.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to run the scraper once
 * Run with: node src/scripts/test-scraper.js
 * 
 * To force Cheerio mode (skip Puppeteer): FORCE_CHEERIO=true node src/scripts/test-scraper.js
 */
(async () => {
  try {
    console.log('🧪 Testing scholarship scraper...\n');
    
    // Note about scraper source
    console.log('📡 Using SmartSimple (UofT Scholarships) scraper\n');
    
    const result = await scrapeAndSave();
    
    console.log('\n✅ Test completed successfully!');
    console.log(`📊 Total scholarships scraped: ${result.count}`);
    console.log(`💾 File saved to: ${result.filePath}`);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Tip: If Puppeteer fails, try running with:');
    console.error('   FORCE_CHEERIO=true npm run scrape:test');
    process.exit(1);
  }
})();

