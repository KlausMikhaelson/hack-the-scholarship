import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sync user from Clerk to database
 * Creates or updates user based on Clerk ID
 */
export const syncUserFromClerk = async (userData) => {
  const { clerkId, email, name, firstName, lastName } = userData;

  if (!clerkId || !email) {
    throw new Error('clerkId and email are required');
  }

  try {
    // Try to find user by clerkId first
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          name: name || `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
          firstName,
          lastName,
          updatedAt: new Date(),
        },
      });
    } else {
      // Check if user exists by email (in case clerkId wasn't set before)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Update existing user with clerkId
        user = await prisma.user.update({
          where: { email },
          data: {
            clerkId,
            name: name || existingUser.name,
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            name: name || `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
            firstName,
            lastName,
            onboardingCompleted: false,
          },
        });
      }
    }

    return user;
  } catch (error) {
    console.error('Error syncing user from Clerk:', error);
    throw error;
  }
};

/**
 * Delete user by Clerk ID
 */
export const deleteUserByClerkId = async (clerkId) => {
  if (!clerkId) {
    throw new Error('clerkId is required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return null; // User doesn't exist, consider it deleted
    }

    // Delete user (cascade will delete profile and applications)
    await prisma.user.delete({
      where: { clerkId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting user by Clerk ID:', error);
    throw error;
  }
};

/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = async (clerkId) => {
  if (!clerkId) {
    throw new Error('clerkId is required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profile: true,
        applications: {
          include: {
            scholarship: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    throw error;
  }
};

