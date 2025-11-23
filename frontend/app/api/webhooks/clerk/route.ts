import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is accessible' });
}

export async function POST(req: NextRequest) {
  console.log('POST handler called!');
  
  try {
    // Get the Svix headers for verification
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.log('Missing Svix headers');
      return new NextResponse('Error occurred -- no svix headers', {
        status: 400,
      });
    }

    // Get the raw body as text for verification
    const body = await req.text();

    // Create a new Svix instance with your secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error occurred', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      // Sync user to database using Prisma
      try {
        const email = email_addresses[0]?.email_address;
        const name = `${first_name || ''} ${last_name || ''}`.trim() || email?.split('@')[0] || 'User';

        if (!email) {
          console.error('No email address found in webhook data');
          // Skip this user but continue processing
        } else {
          // Try to find user by clerkId first
        let user = await prisma.user.findUnique({
          where: { clerkId: id },
        });

        if (user) {
          // Update existing user
          await prisma.user.update({
            where: { clerkId: id },
            data: {
              email,
              name: name || user.name,
              firstName: first_name,
              lastName: last_name,
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
            await prisma.user.update({
              where: { email },
              data: {
                clerkId: id,
                name: name || existingUser.name,
                firstName: first_name,
                lastName: last_name,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new user
            await prisma.user.create({
              data: {
                clerkId: id,
                email,
                name,
                firstName: first_name,
                lastName: last_name,
                onboardingCompleted: false,
              },
            });
          }
        }
        }
      } catch (error) {
        console.error('Error syncing user from Clerk webhook:', error);
        // Don't fail the webhook, just log the error
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      // Delete user from database using Prisma
      try {
        const user = await prisma.user.findUnique({
          where: { clerkId: id },
        });

        if (user) {
          // Delete user (cascade will delete profile and applications)
          await prisma.user.delete({
            where: { clerkId: id },
          });
        }
      } catch (error) {
        console.error('Error deleting user from Clerk webhook:', error);
        // Don't fail the webhook, just log the error
      }
    }

    return new NextResponse('', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

