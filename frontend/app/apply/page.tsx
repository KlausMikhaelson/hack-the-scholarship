"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplyPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new onboarding flow
    router.push("/onboarding");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirecting...
        </h2>
        <p className="text-gray-500">Taking you to the new application flow</p>
      </div>
    </div>
  );
}
