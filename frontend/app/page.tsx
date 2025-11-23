"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Zap,
  BarChart3,
  FileText,
  Target,
  Bot,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    setHasProfile(onboardingCompleted === "true");
  }, []);

  const handleGetStarted = () => {
    if (hasProfile) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-sm font-medium mb-8">
          <Bot className="w-4 h-4" />
          <span>Powered by Claude</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#111] mb-6">
          Your AI scholarship assistant.
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          One profile. Unlimited scholarships. <br />
          Claude crafts the perfect essays for every opportunity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGetStarted}
            className="h-12 px-8 rounded-full bg-blue-600 text-white font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard"
            className="h-12 px-8 rounded-full bg-white border border-gray-200 text-gray-700 font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <Zap className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              One Profile, Many Apps
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Create your profile once and reuse it across all scholarship
              applications.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <BarChart3 className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Smart Analysis
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI analyzes each scholarship and adapts your application
              accordingly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <Target className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Editable Essays
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Generate, edit, and refine essays with AI-powered suggestions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <FileText className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Track Progress
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Manage multiple applications with status tracking and deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
