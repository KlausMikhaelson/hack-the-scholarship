import { syncUserFromClerk, deleteUserByClerkId, getUserByClerkId } from '../services/user.service.js';
import { logger } from '../utils/logger.js';

/**
 * Sync user from Clerk webhook
 * POST /api/users/sync
 */
export const syncUser = async (req, res, next) => {
  try {
    const { clerkId, email, name, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({
        error: 'clerkId and email are required',
      });
    }

    const user = await syncUserFromClerk({
      clerkId,
      email,
      name,
      firstName,
      lastName,
    });

    logger.info(`User synced from Clerk: ${clerkId} (${email})`);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    logger.error('Error syncing user:', error);
    next(error);
  }
};

/**
 * Get user by Clerk ID
 * GET /api/users/clerk/:clerkId
 */
export const getUserByClerk = async (req, res, next) => {
  try {
    const { clerkId } = req.params;

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Error getting user by Clerk ID:', error);
    next(error);
  }
};

/**
 * Delete user by Clerk ID
 * DELETE /api/users/:clerkId
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { clerkId } = req.params;

    const result = await deleteUserByClerkId(clerkId);

    if (!result) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    logger.info(`User deleted from Clerk webhook: ${clerkId}`);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};

