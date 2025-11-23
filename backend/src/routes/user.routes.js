import express from 'express';
import { syncUser, getUserByClerk, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

// Sync user from Clerk webhook
router.post('/sync', syncUser);

// Get user by Clerk ID
router.get('/clerk/:clerkId', getUserByClerk);

// Delete user by Clerk ID (from webhook)
router.delete('/:clerkId', deleteUser);

export { router as userRoutes };

