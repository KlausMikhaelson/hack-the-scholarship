import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

      // Sync user to backend database
      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
        const response = await fetch(`${backendUrl}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: id,
            email: email_addresses[0]?.email_address,
            name: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address?.split('@')[0] || 'User',
            firstName: first_name,
            lastName: last_name,
          }),
        });

        if (!response.ok) {
          console.error('Failed to sync user to backend:', await response.text());
        }
      } catch (error) {
        console.error('Error syncing user to backend:', error);
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      // Delete user from backend database
      try {
        // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          console.error('Failed to delete user from backend:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting user from backend:', error);
      }
    }

    return new NextResponse('', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

