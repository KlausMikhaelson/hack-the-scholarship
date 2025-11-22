import express from 'express';
import { 
  getExamples, 
  getExampleById, 
  createExample, 
  updateExample, 
  deleteExample 
} from '../controllers/example.controller.js';

const router = express.Router();

router.get('/', getExamples);
router.get('/:id', getExampleById);
router.post('/', createExample);
router.put('/:id', updateExample);
router.delete('/:id', deleteExample);

export { router as exampleRoutes };

