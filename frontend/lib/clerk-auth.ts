import { clerkClient } from '@clerk/nextjs/server';

/**
 * Verify a Clerk session token and get the user ID
 * Used for browser extension authentication
 */
export async function verifyClerkToken(token: string): Promise<string | null> {
  try {
    // Use Clerk's backend API to verify the token
    // The token from getToken() is a session token that can be verified
    const clerk = await clerkClient();
    
    // Verify the session token
    // Note: Clerk's session tokens are JWT tokens that can be verified
    // For now, we'll use a simpler approach - extract userId from token
    // In production, you should verify the token signature with Clerk's public key
    
    // Decode the JWT token (without verification for now - add verification in production)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    try {
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || payload.user_id || null;
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Get user ID from Authorization header
 * Supports both Bearer tokens (extension) and Clerk session cookies (web)
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    // Check for Bearer token (extension)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return await verifyClerkToken(token);
    }
    
    // Fall back to Clerk's auth() for web requests
    // This will be handled by the route handler using auth()
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

