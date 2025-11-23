'use client';

import React, { useState, useEffect } from 'react';
import ComparativeEssays from '@/components/ComparativeEssays';
import { useAuth } from '@clerk/nextjs';
import { FileText, Loader2, Sparkles } from 'lucide-react';

interface ComparativeEssay {
  scholarshipType: string;
  essay: string;
  angle: string;
  emphasis: string[];
  reframing: string;
  keywords: string[];
}

export default function ComparePage() {
  const { isLoaded } = useAuth();
  const [essays, setEssays] = useState<ComparativeEssay[]>([]);
  const [comparison, setComparison] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/applications/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate comparative essays');
      }

      const data = await response.json();
      setEssays(data.essays || []);
      setComparison(data.comparison || {});
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate essays');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#111] mb-3">Comparative Essay Generator</h1>
          <p className="text-lg text-gray-600">
            Generate multiple essay variations from your profile to see how the same story is reframed for different scholarship types
          </p>
        </div>

        {essays.length === 0 && !isLoading && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-200">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Generate Comparative Essays
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Click the button below to generate 3 different essay variations for Merit, Service, and Leadership scholarships. 
              See how AI adapts your story for each type.
            </p>
            <button
              onClick={handleGenerate}
              className="px-8 py-3.5 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
            >
              Generate Essays
            </button>
          </div>
        )}

        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-gray-700 font-semibold mb-1">Generating comparative essays...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Retry
            </button>
          </div>
        )}

        {essays.length > 0 && !isLoading && (
          <>
            <div className="mb-6">
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Regenerate Essays
              </button>
            </div>
            <ComparativeEssays essays={essays} comparison={comparison} />
          </>
        )}
      </div>
  );
}

