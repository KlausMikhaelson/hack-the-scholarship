import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gets a session cookie by visiting the initial page
 * @returns {Promise<string>} JSESSIONID cookie value
 */
const getSessionCookie = async () => {
  try {
    const response = await axios.get('https://uoftscholarships.smartsimple.com/ex/ex_openreport.jsp', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 30000,
      maxRedirects: 5
    });

    // Extract JSESSIONID from Set-Cookie header
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      for (const cookie of cookies) {
        const match = cookie.match(/JSESSIONID=([^;]+)/);
        if (match) {
          return match[1];
        }
      }
    }

    // If no cookie in headers, try to extract from response
    const jsessionMatch = response.data.match(/JSESSIONID=([^"&]+)/);
    if (jsessionMatch) {
      return jsessionMatch[1];
    }

    throw new Error('Could not obtain session cookie');
  } catch (error) {
    console.error('Error getting session cookie:', error.message);
    throw error;
  }
};

/**
 * Scrapes scholarships from SmartSimple system (UofT Scholarships)
 * @param {number} page - Page number to scrape
 * @param {string} sessionId - JSESSIONID cookie value
 * @returns {Promise<{scholarships: Array, hasMore: boolean}>} Scholarship data and pagination info
 */
const scrapeSmartSimplePage = async (page = 1, sessionId = null) => {
  try {
    // Get session cookie if not provided
    if (!sessionId) {
      sessionId = await getSessionCookie();
      console.log('✅ Obtained session cookie');
    }

    const response = await axios.post(
      'https://uoftscholarships.smartsimple.com/ex/ex_openreport.jsp',
      new URLSearchParams({
        'ss_formtoken': '',
        'reportid': '46862',
        'sorttype': '',
        'sortdirection': 'asc',
        'orderby': '',
        'curpagesize': '100',
        'page': page.toString(),
        'token': '@HwoGSxocZERdRRtfQRxZQ11SZV1zH3pgEw~~',
        'isframe': '1',
        'cf_4_c1753503': '',
        'cf_0_c1754210': '',
        'cf_1_c1753296': '%',
        'cf_2_c1744720': '',
        'cf_5_c1744705': '%',
        'cf_3_c1744765': '%',
        'reportname': 'Award Explorer | Undergraduate | University of Toronto',
        'chartid': '0',
        'export': '',
        'key': '',
        'lang': '0',
        'width': '640',
        'height': '400'
      }),
      {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'max-age=0',
          'Connection': 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': `JSESSIONID=${sessionId}`,
          'Origin': 'https://uoftscholarships.smartsimple.com',
          'Referer': 'https://uoftscholarships.smartsimple.com/ex/ex_openreport.jsp',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"'
        },
        timeout: 30000
      }
    );

    const $ = cheerio.load(response.data);
    const scholarships = [];

    // Find the table with scholarship data
    // Look for table rows (tr) that contain scholarship information
    $('table tr').each((index, element) => {
      const $row = $(element);
      const $cells = $row.find('td');

      // Skip header rows and empty rows
      if ($cells.length === 0 || $row.find('th').length > 0) {
        return;
      }

      // Extract data from table cells
      const cells = [];
      $cells.each((i, cell) => {
        const $cell = $(cell);
        const text = $cell.text().trim();
        // Also check for links
        const link = $cell.find('a').attr('href');
        cells.push({ text, link });
      });

      // Skip if no meaningful data
      if (cells.length === 0 || cells.every(c => !c.text || c.text.length < 2)) {
        return;
      }

      // Parse scholarship data from cells
      // The first cell is typically the scholarship name/title
      const title = cells[0]?.text || cells.find(c => c.text && c.text.length > 5)?.text || 'Unknown';
      
      // Find link (could be in first cell or any cell)
      let url = null;
      for (const cell of cells) {
        if (cell.link) {
          url = cell.link.startsWith('http') 
            ? cell.link 
            : `https://uoftscholarships.smartsimple.com${cell.link.startsWith('/') ? cell.link : '/' + cell.link}`;
          break;
        }
      }

      // Extract amount (look for $ signs)
      const amount = cells.find(c => c.text && /\$[\d,]+/.test(c.text))?.text || null;

      // Extract deadline (look for date patterns)
      const deadline = cells.find(c => {
        const text = c.text || '';
        return /(deadline|due|closes?|date|application)/i.test(text) || 
               /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text) ||
               /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i.test(text);
      })?.text || null;

      // Combine remaining cells as description
      const description = cells.slice(1)
        .map(c => c.text)
        .filter(text => text && text.length > 2)
        .join(' ')
        .substring(0, 1000);

      const scholarship = {
        id: scholarships.length + 1,
        title: title,
        url: url,
        amount: amount,
        deadline: deadline,
        description: description || null,
        // Store all cell data for reference/debugging
        rawData: cells.map(c => c.text),
        scrapedAt: new Date().toISOString()
      };

      // Only add if we have at least a title
      if (scholarship.title && scholarship.title !== 'Unknown' && scholarship.title.length > 2) {
        scholarships.push(scholarship);
      }
    });

    // Check if there are more pages
    // Look for pagination indicators - check for "Next" link or page numbers
    let hasMore = false;
    $('a').each((i, el) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr('href') || '';
      
      // Check for "Next" button or page number links
      if (text === 'next' || text === '>' || 
          /page\s*\d+/i.test(text) || 
          (href.includes('page=') && /\d+/.test(href))) {
        hasMore = true;
        return false; // Break out of loop
      }
    });
    
    // Also check if we got a full page of results (might indicate more pages)
    if (scholarships.length >= 100) {
      hasMore = true;
    }

    return { scholarships, hasMore, sessionId };
  } catch (error) {
    console.error(`Error scraping page ${page}:`, error.message);
    throw error;
  }
};

/**
 * Scrapes scholarships using SmartSimple system (UofT Scholarships)
 * @returns {Promise<Array>} Array of scholarship objects
 */
const scrapeWithCheerio = async () => {
  console.log('📡 Scraping UofT Scholarships (SmartSimple)...');
  const allScholarships = [];
  let sessionId = null;
  let page = 1;
  let hasMore = true;
  const maxPages = 10; // Limit pages for testing

  try {
    while (hasMore && page <= maxPages) {
      console.log(`  📄 Scraping page ${page}...`);
      
      const result = await scrapeSmartSimplePage(page, sessionId);
      allScholarships.push(...result.scholarships);
      sessionId = result.sessionId; // Reuse session ID
      hasMore = result.hasMore && result.scholarships.length > 0;
      
      console.log(`    ✅ Found ${result.scholarships.length} scholarships on page ${page}`);
      
      page++;
      
      // Be respectful - add delay between pages
      if (hasMore && page <= maxPages) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ Found ${allScholarships.length} total scholarships`);
    return allScholarships;
  } catch (error) {
    console.error('❌ SmartSimple scraping failed:', error.message);
    throw error;
  }
};

/**
 * Scrapes scholarships from ScholarshipsCanada.com using Puppeteer
 * @returns {Promise<Array>} Array of scholarship objects
 */
const scrapeWithPuppeteer = async () => {
  // Dynamic import for Puppeteer (optional dependency)
  let puppeteer;
  try {
    const puppeteerModule = await import('puppeteer');
    puppeteer = puppeteerModule.default;
  } catch (error) {
    throw new Error('Puppeteer is not installed. Install it with: npm install puppeteer');
  }

  let browser;
  const scholarships = [];

  try {
    console.log('🌐 Using Puppeteer method...');
    
    // Launch browser with improved options for macOS
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-blink-features=AutomationControlled'
      ],
      timeout: 30000
    });

    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    console.log('📄 Navigating to ScholarshipsCanada.com...');
    
    try {
      // Use more reliable navigation strategy
      await page.goto('https://www.scholarshipscanada.com', {
        waitUntil: 'domcontentloaded', // More reliable than networkidle2
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForTimeout(3000);
      
      // Wait for any dynamic content
      try {
        await page.waitForSelector('a[href*="Scholarship"], a[href*="scholarship"]', {
          timeout: 10000
        });
      } catch (selectorError) {
        console.warn('  Warning: Scholarship links selector not found, continuing anyway...');
      }
    } catch (navError) {
      // If navigation fails, try reload
      console.warn('  Navigation issue, trying reload...');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
    }

    // Extract scholarship data
    console.log('🔍 Extracting scholarship data...');
    
    let scholarshipData = [];
    try {
      // Check if page is still valid
      const url = page.url();
      console.log(`  Current page URL: ${url}`);
      
      scholarshipData = await page.evaluate(() => {
        const results = [];
        
        // Get all potential scholarship links
        const links = Array.from(document.querySelectorAll('a[href*="Scholarship"], a[href*="scholarship"]'));
        
        links.forEach((link, index) => {
          try {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const fullUrl = href.startsWith('http') ? href : `https://www.scholarshipscanada.com${href.startsWith('/') ? href : '/' + href}`;
            
            // Get text content
            const text = link.textContent?.trim() || '';
            
            // Try to find parent element with more details
            const parent = link.closest('div, article, li, section');
            const description = parent?.textContent?.trim() || '';
            
            // Extract amount if mentioned
            const amountMatch = description.match(/\$[\d,]+/g);
            const amount = amountMatch ? amountMatch[0] : null;
            
            // Extract deadline if mentioned
            const deadlineMatch = description.match(/(deadline|due|closes?)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
            const deadline = deadlineMatch ? deadlineMatch[2] : null;

            if (text && href) {
              results.push({
                id: index + 1,
                title: text,
                url: fullUrl,
                description: description.substring(0, 500), // Limit description length
                amount: amount,
                deadline: deadline,
                scrapedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            // Silently skip errors in processing
          }
        });

        // Remove duplicates based on URL
        const uniqueResults = [];
        const seenUrls = new Set();
        
        results.forEach(item => {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            uniqueResults.push(item);
          }
        });

        return uniqueResults;
      });
    } catch (evalError) {
      console.warn('  Warning: Error extracting data from page:', evalError.message);
      // If evaluation fails, try to get basic info
      try {
        const html = await page.content();
        if (html.includes('scholarship') || html.includes('Scholarship')) {
          console.log('  Page contains scholarship content, but extraction failed');
        }
      } catch (htmlError) {
        // Ignore
      }
      throw new Error(`Failed to extract data: ${evalError.message}`);
    }

    scholarships.push(...scholarshipData);

    // If we found scholarships, try to get more details from individual pages
    if (scholarships.length > 0) {
      console.log(`✅ Found ${scholarships.length} scholarships`);
      console.log('📖 Fetching detailed information...');
      
      // Limit to first 10 for testing (remove limit later)
      const limitedScholarships = scholarships.slice(0, 10);
      
      for (let i = 0; i < limitedScholarships.length; i++) {
        try {
          const scholarship = limitedScholarships[i];
          console.log(`  Fetching details for: ${scholarship.title.substring(0, 50)}...`);
          
          // Use more reliable navigation for detail pages
          try {
            await page.goto(scholarship.url, {
              waitUntil: 'domcontentloaded',
              timeout: 15000
            });
            await page.waitForTimeout(1500);
          } catch (navError) {
            console.warn(`    Skipping ${scholarship.title.substring(0, 30)}... (navigation failed)`);
            continue;
          }
          
          const details = await page.evaluate(() => {
            const detailsObj = {
              fullDescription: '',
              eligibility: '',
              applicationProcess: '',
              contactInfo: ''
            };

            // Try to extract main content
            const contentSelectors = [
              'main',
              '.content',
              '.main-content',
              'article',
              '#content',
              '.scholarship-details'
            ];

            for (const selector of contentSelectors) {
              const element = document.querySelector(selector);
              if (element) {
                detailsObj.fullDescription = element.textContent?.trim().substring(0, 2000) || '';
                break;
              }
            }

            // Extract eligibility requirements
            const eligibilityText = Array.from(document.querySelectorAll('*'))
              .find(el => el.textContent?.toLowerCase().includes('eligibility'))
              ?.textContent?.trim() || '';
            
            detailsObj.eligibility = eligibilityText.substring(0, 500);

            return detailsObj;
          });

          // Merge details
          limitedScholarships[i] = {
            ...scholarship,
            ...details
          };

          // Be respectful - add delay between requests
          await page.waitForTimeout(2000);
        } catch (error) {
          console.error(`  Error fetching details for ${scholarship.title}:`, error.message);
        }
      }
    }

    console.log(`✅ Puppeteer scraping complete! Found ${scholarships.length} scholarships`);

    return scholarships;
  } catch (error) {
    console.error('❌ Puppeteer scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('Warning: Error closing browser:', closeError.message);
      }
    }
  }
};

/**
 * Main scraping function - uses SmartSimple (UofT Scholarships) by default
 * Can be forced to use Puppeteer by setting USE_PUPPETEER=true in env
 * @returns {Promise<Array>} Array of scholarship objects
 */
export const scrapeScholarships = async () => {
  console.log('🚀 Starting scholarship scraper...');
  
  // Check if we should use Puppeteer (legacy method)
  const usePuppeteer = process.env.USE_PUPPETEER === 'true';
  
  if (usePuppeteer) {
    console.log('🌐 Using Puppeteer mode (forced via USE_PUPPETEER env variable)');
    try {
      return await scrapeWithPuppeteer();
    } catch (puppeteerError) {
      console.warn('⚠️  Puppeteer failed, falling back to SmartSimple...');
      console.warn('   Error:', puppeteerError.message);
      // Fall through to SmartSimple
    }
  }
  
  // Default: Use SmartSimple (UofT Scholarships)
  console.log('📡 Using SmartSimple (UofT Scholarships) scraper');
  return await scrapeWithCheerio();
};

/**
 * Saves scholarships data to JSON file
 * @param {Array} scholarships - Array of scholarship objects
 * @param {string} filename - Output filename (default: scholarships.json)
 */
export const saveScholarshipsToFile = async (scholarships, filename = 'scholarships.json') => {
  try {
    const outputDir = path.join(__dirname, '../../data');
    
    // Create data directory if it doesn't exist
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, filename);
    
    // Add metadata
    const data = {
      metadata: {
        totalScholarships: scholarships.length,
        scrapedAt: new Date().toISOString(),
        source: 'https://uoftscholarships.smartsimple.com/ex/ex_openreport.jsp',
        sourceName: 'UofT Scholarships (SmartSimple)'
      },
      scholarships: scholarships
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log(`💾 Saved ${scholarships.length} scholarships to ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('❌ Error saving to file:', error);
    throw error;
  }
};

/**
 * Main function to scrape and save scholarships
 * @param {boolean} parseData - Whether to parse and enrich the data (default: false)
 */
export const scrapeAndSave = async (parseData = false) => {
  try {
    const scholarships = await scrapeScholarships();
    const filePath = await saveScholarshipsToFile(scholarships);
    
    let parsedFilePath = null;
    if (parseData) {
      const { parseScholarshipsFromFile } = await import('./scholarship-parser.service.js');
      parsedFilePath = path.join(path.dirname(filePath), 'scholarships-parsed.json');
      await parseScholarshipsFromFile(filePath, parsedFilePath);
      console.log(`📋 Parsed data saved to: ${parsedFilePath}`);
    }
    
    return {
      success: true,
      count: scholarships.length,
      filePath: filePath,
      parsedFilePath: parsedFilePath
    };
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    throw error;
  }
};

