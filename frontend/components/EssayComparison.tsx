'use client';

import React from 'react';

interface EssayComparisonProps {
  originalSample?: string;
  tailoredEssay: string;
}

export default function EssayComparison({ originalSample, tailoredEssay }: EssayComparisonProps) {
  if (!originalSample) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Step 6</span>
        <h3 className="text-lg font-semibold text-[#111]">Before/After Comparison</h3>
      </div>
      <p className="text-sm text-gray-500 mb-8 ml-[70px]">
        See how our AI transforms generic messaging into scholarship-specific content.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Before */}
        <div className="flex flex-col">
          <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-t-lg text-sm font-medium border-b border-gray-200">
            Generic Writing Sample
          </div>
          <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 h-full min-h-[300px] shadow-inner">
            <div className="prose prose-sm prose-gray max-w-none opacity-80">
              {originalSample.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* After */}
        <div className="flex flex-col">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-t-lg text-sm font-medium border-b border-blue-100">
            Tailored for This Scholarship
          </div>
          <div className="bg-white border border-blue-100 border-t-0 rounded-b-lg p-6 h-full min-h-[300px] shadow-inner">
            <div className="prose prose-sm prose-slate max-w-none">
              {tailoredEssay.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 ml-[70px] p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-900 leading-relaxed">
          <span className="font-semibold">Optimization Note:</span> The tailored essay specifically addresses the scholarship&apos;s values,
          uses language that resonates with the selection criteria, and highlights relevant achievements
          that match the scholarship&apos;s priorities.
        </p>
      </div>
    </div>
  );
}
