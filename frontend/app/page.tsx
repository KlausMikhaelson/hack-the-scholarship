"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  Zap,
  BarChart3,
  FileText,
  Target,
} from "lucide-react";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#fafafa]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
          <Zap className="w-3 h-3" />
          <span>AI-Powered Scholarship Assistant</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#111] mb-6">
          Scholarship Application <br className="hidden md:block" /> Optimizer
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Craft perfectly tailored scholarship applications with advanced AI
          analysis, adaptive weighting, and explainable targeting.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/apply"
            className="h-12 px-8 rounded-full bg-blue-600 text-white font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
          >
            Start Application
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#samples"
            className="h-12 px-8 rounded-full bg-white border border-gray-200 text-gray-700 font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            View Samples
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <Zap className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Pattern Recognition
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Identifies hidden values and messaging patterns in scholarship
              descriptions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <BarChart3 className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Adaptive Weighting
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Calculates criteria importance dynamically based on scholarship
              personality.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <Target className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Strength Mapping
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Matches your profile to values with evidence-based justification.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <FileText className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Tailored Essays
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Generates essays that resonate with specific selection criteria.
            </p>
          </div>
        </div>
      </div>

      {/* Sample Scholarships Section */}
      <div
        id="samples"
        className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-[#111] mb-12">
          Sample Scholarships
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              name: "Gates Millennium Scholarship",
              focus: "Leadership & Service",
            },
            {
              name: "Google Generation Scholarship",
              focus: "Innovation & Technology",
            },
            { name: "Coca-Cola Scholars Program", focus: "Community Impact" },
            {
              name: "National Merit Scholarship",
              focus: "Academic Excellence",
            },
            { name: "Dell Scholars Program", focus: "Grit & Determination" },
          ].map((scholarship, index) => (
            <Link
              href="/apply"
              key={index}
              className="group bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-500 transition-colors flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {scholarship.name}
                </h3>
                <p className="text-sm text-gray-500">{scholarship.focus}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
