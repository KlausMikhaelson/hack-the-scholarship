import express from 'express';
import { exampleRoutes } from './example.routes.js';
import { scraperRoutes } from './scraper.routes.js';
import { userRoutes } from './user.routes.js';

const router = express.Router();

// Mount route modules
router.use('/examples', exampleRoutes);
router.use('/scraper', scraperRoutes);
router.use('/users', userRoutes);

export { router as routes };

