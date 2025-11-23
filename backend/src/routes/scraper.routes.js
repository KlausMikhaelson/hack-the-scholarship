import express from 'express';
import { runScraper, runScraperSync } from '../controllers/scraper.controller.js';

const router = express.Router();

// Async scraping (returns immediately)
router.get('/run', runScraper);

// Synchronous scraping (waits for completion)
router.get('/run-sync', runScraperSync);

export { router as scraperRoutes };

