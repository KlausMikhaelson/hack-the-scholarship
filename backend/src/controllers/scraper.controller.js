import { scrapeAndSave } from '../services/scraper.service.js';
import { logger } from '../utils/logger.js';

/**
 * Trigger scholarship scraping
 * GET /api/scraper/run
 */
export const runScraper = async (req, res, next) => {
  try {
    logger.info('Scraper endpoint called');
    
    // Run scraper asynchronously
    scrapeAndSave()
      .then(result => {
        logger.info(`Scraping completed: ${result.count} scholarships saved to ${result.filePath}`);
      })
      .catch(error => {
        logger.error('Scraping error:', error);
      });

    // Return immediately
    res.json({
      success: true,
      message: 'Scraping started. Check logs for progress.',
      note: 'This is an async operation. Results will be saved to data/scholarships.json'
    });
  } catch (error) {
    logger.error('Error starting scraper:', error);
    next(error);
  }
};

/**
 * Trigger scholarship scraping synchronously (wait for completion)
 * GET /api/scraper/run-sync
 */
export const runScraperSync = async (req, res, next) => {
  try {
    logger.info('Synchronous scraper endpoint called');
    
    const result = await scrapeAndSave();
    
    res.json({
      success: true,
      message: 'Scraping completed successfully',
      count: result.count,
      filePath: result.filePath
    });
  } catch (error) {
    logger.error('Scraping error:', error);
    next(error);
  }
};

