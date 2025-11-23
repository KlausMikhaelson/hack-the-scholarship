# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication with webhooks for the Scholarship Optimizer application.

## Prerequisites

1. A Clerk account (sign up at https://clerk.com)
2. Your application running locally or deployed

## Step 1: Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Create Application"
3. Choose your authentication methods (Email, Google, etc.)
4. Complete the setup wizard

## Step 2: Get Your API Keys

1. In your Clerk Dashboard, go to **API Keys** (https://dashboard.clerk.com/last-active?path=api-keys)
2. Copy your **Publishable Key** and **Secret Key**
3. Add them to your `.env.local` file in the `frontend` directory:

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Step 3: Set Up Webhook

### For Local Development

1. Install [ngrok](https://ngrok.com/) or use [Clerk's webhook testing tool](https://clerk.com/docs/integrations/webhooks/overview)
2. Start your Next.js development server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Expose your local server using ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Create Webhook in Clerk

1. Go to **Webhooks** in your Clerk Dashboard (https://dashboard.clerk.com/last-active?path=webhooks)
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Local: `https://2d908f354f2a.ngrok-free.app/api/webhooks/clerk`
   - Production: `https://yourdomain.com/api/webhooks/clerk`
4. Select the events to listen for:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** and add it to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_...
```

## Step 4: Configure Backend URL

Add the backend URL to your `.env.local`:

```bash
BACKEND_URL=http://localhost:3001
```

For production, update this to your production backend URL.

## Step 5: Run Database Migration

After setting up Clerk, you need to update your database schema to include the `clerkId` field:

```bash
cd backend
npm run prisma:migrate
```

This will create a migration for the new `clerkId`, `firstName`, and `lastName` fields in the User model.

## Step 6: Start Your Application

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit `http://localhost:3000` and test the authentication flow

## How It Works

### Authentication Flow

1. User signs up/signs in through Clerk
2. Clerk webhook sends `user.created` or `user.updated` event
3. Frontend webhook endpoint (`/api/webhooks/clerk`) receives the event
4. Webhook verifies the event signature using the webhook secret
5. Webhook calls backend API (`/api/users/sync`) to sync user to database
6. Backend creates or updates user in Prisma database with `clerkId`

### User Sync

The webhook automatically:
- Creates new users in your database when they sign up
- Updates user information when they update their Clerk profile
- Deletes users when they delete their Clerk account

### Protected Routes

The `/apply` page is now protected and requires authentication. Users will be redirected to the home page if not signed in.

## Testing

1. Sign up a new user through Clerk
2. Check your backend logs to see the user sync
3. Verify the user was created in your database:
   ```bash
   cd backend
   npm run prisma:studio
   ```
4. Check the `User` table for the new user with a `clerkId`

## Troubleshooting

### Webhook Not Receiving Events

- Verify the webhook URL is correct and accessible
- Check that the webhook secret is set correctly in `.env.local`
- Check Clerk Dashboard webhook logs for delivery status

### User Not Syncing to Database

- Verify `BACKEND_URL` is correct in `.env.local`
- Check backend server is running
- Check backend logs for errors
- Verify database connection is working

### Authentication Not Working

- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Verify middleware is working (check network tab)

## Production Deployment

1. Update environment variables in your hosting platform
2. Update webhook URL in Clerk Dashboard to point to production
3. Update `BACKEND_URL` to production backend URL
4. Ensure database migrations have been run in production

## Security Notes

- Never commit `.env.local` to version control (already in `.gitignore`)
- Use different Clerk applications for development and production
- Keep your webhook secret secure
- Regularly rotate your API keys

