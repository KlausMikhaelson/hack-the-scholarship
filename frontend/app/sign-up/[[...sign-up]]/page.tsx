'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/onboarding';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] py-12 px-4">
      <div className="w-full max-w-md">
        <SignUp 
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl={redirectUrl}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border border-gray-200",
            },
          }}
        />
      </div>
    </div>
  );
}

