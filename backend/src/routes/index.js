import express from 'express';
import { exampleRoutes } from './example.routes.js';
import { scraperRoutes } from './scraper.routes.js';

const router = express.Router();

// Mount route modules
router.use('/examples', exampleRoutes);
router.use('/scraper', scraperRoutes);

export { router as routes };

