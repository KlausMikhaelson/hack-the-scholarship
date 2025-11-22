import express from 'express';
import { exampleRoutes } from './example.routes.js';

const router = express.Router();

// Mount route modules
router.use('/examples', exampleRoutes);

export { router as routes };

