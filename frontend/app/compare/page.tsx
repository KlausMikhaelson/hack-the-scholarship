'use client';

import React, { useState, useEffect } from 'react';
import ComparativeEssays from '@/components/ComparativeEssays';
import { useAuth } from '@clerk/nextjs';
import { FileText, Loader2 } from 'lucide-react';

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
        throw new Error('Failed to generate comparative essays');
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Loading...</p>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111] mb-2">Comparative Essay Generator</h1>
          <p className="text-gray-500">
            Generate multiple essay variations from your profile to see how the same story is reframed for different scholarship types
          </p>
        </div>

        {essays.length === 0 && !isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Generate Comparative Essays
            </h2>
            <p className="text-gray-500 mb-6">
              Click the button below to generate 3 different essay variations for Merit, Service, and Leadership scholarships.
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Generate Essays
            </button>
          </div>
        )}

        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-500">Generating comparative essays...</p>
            <p className="text-sm text-gray-400 mt-2">This may take 30-60 seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
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
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
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

