"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Brain,
  PenTool,
  CheckCircle2,
  TrendingUp,
  Rocket,
  Users,
  Trophy,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check onboarding status from API if user is signed in
    if (isLoaded && isSignedIn) {
      setIsChecking(true);
      fetch("/api/users/profile")
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return null;
        })
        .then((data) => {
          // If profile exists, user has completed onboarding
          setHasProfile(!!data?.profile);
        })
        .catch(() => {
          setHasProfile(false);
        })
        .finally(() => {
          setIsChecking(false);
        });
    } else if (isLoaded && !isSignedIn) {
      // Not signed in, no profile
      setHasProfile(false);
    }
  }, [isSignedIn, isLoaded]);

  const handleGetStarted = () => {
    if (!isLoaded) return; // Wait for auth to load
    
    if (isSignedIn && hasProfile) {
      router.push("/dashboard");
    } else if (isSignedIn && !hasProfile) {
      router.push("/onboarding");
    } else {
      // Not signed in - redirect to sign up (which will go to onboarding)
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Badges */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium shadow-sm hover:bg-amber-100 transition-colors cursor-default">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Winner: Toronto Anthropic AI Hackathon</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Claude AI</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#111] mb-6 leading-tight">
          Win more scholarships.
          <br />
          <span className="text-emerald-600">Write less.</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          One profile. Unlimited opportunities. 
          <br className="hidden md:block" />
          <span className="text-gray-500">AI crafts personalized essays for every scholarship.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button
            onClick={handleGetStarted}
            className="group h-14 px-10 rounded-xl bg-[#111] text-white font-semibold flex items-center gap-2 hover:bg-[#1a1a1a] transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            href="/dashboard"
            className="h-14 px-10 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold flex items-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            View Dashboard
          </Link>
        </div>

        {/* Stats or Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Free to start</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Privacy-first</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center mb-5 border border-emerald-100 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <Users className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">
              One Profile, Many Apps
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed relative z-10">
              Create your profile once and reuse it across all scholarship applications. Save time, stay consistent.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center mb-5 border border-blue-100 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <Brain className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">
              Smart Analysis
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed relative z-10">
              AI analyzes each scholarship&apos;s values and adapts your application to match what they&apos;re looking for.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center mb-5 border border-amber-100 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <PenTool className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">
              Editable Essays
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed relative z-10">
              Generate, edit, and refine essays with AI-powered suggestions. Full control, zero hassle.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 rounded-bl-full -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-14 h-14 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl flex items-center justify-center mb-5 border border-rose-100 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <TrendingUp className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">
              Track Progress
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed relative z-10">
              Manage multiple applications with status tracking, deadlines, and progress monitoring all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden bg-[#111] rounded-3xl p-12 text-center shadow-2xl">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2" />
             <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-8 ring-1 ring-white/10">
              <Rocket className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to win more scholarships?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
              Join students who are already using AI to craft winning applications in less time.
            </p>
            <button
              onClick={handleGetStarted}
              className="h-14 px-10 rounded-xl bg-white text-black font-bold flex items-center gap-2 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 mx-auto"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
