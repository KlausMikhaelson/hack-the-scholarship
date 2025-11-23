'use client';

import React, { useState } from 'react';
import { Award, FileText, TrendingUp, Users, Lightbulb } from 'lucide-react';

interface ComparativeEssay {
  scholarshipType: string;
  essay: string;
  angle: string;
  emphasis: string[];
  reframing: string;
  keywords: string[];
}

interface ComparativeEssaysProps {
  essays: ComparativeEssay[];
  comparison: {
    howSameStory?: string;
    keyDifferences?: string[];
    strategicChoices?: string;
  };
}

const typeIcons: Record<string, React.ReactNode> = {
  merit: <Award className="w-5 h-5" />,
  service: <Users className="w-5 h-5" />,
  leadership: <TrendingUp className="w-5 h-5" />,
  innovation: <Lightbulb className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  merit: 'bg-blue-50 text-blue-700 border-blue-200',
  service: 'bg-green-50 text-green-700 border-green-200',
  leadership: 'bg-purple-50 text-purple-700 border-purple-200',
  innovation: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function ComparativeEssays({ essays, comparison }: ComparativeEssaysProps) {
  const [selectedEssay, setSelectedEssay] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Comparative Essay Analysis
        </h2>
        <p className="text-gray-600 text-sm">
          See how the same student profile is reframed for different scholarship types. 
          This demonstrates the power of adaptive essay generation.
        </p>
      </div>

      {/* Comparison Overview */}
      {comparison.howSameStory && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How the Same Story is Told Differently</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{comparison.howSameStory}</p>
          
          {comparison.keyDifferences && comparison.keyDifferences.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Differences:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {comparison.keyDifferences.map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Essay Selector */}
      <div className="grid grid-cols-3 gap-4">
        {essays.map((essay, index) => (
          <button
            key={index}
            onClick={() => setSelectedEssay(index)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedEssay === index
                ? `${typeColors[essay.scholarshipType.toLowerCase()]} border-current`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {typeIcons[essay.scholarshipType.toLowerCase()]}
              <span className="font-semibold capitalize">{essay.scholarshipType}</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{essay.angle}</p>
          </button>
        ))}
      </div>

      {/* Selected Essay Display */}
      {essays[selectedEssay] && (
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[essays[selectedEssay].scholarshipType.toLowerCase()]}`}>
                {typeIcons[essays[selectedEssay].scholarshipType.toLowerCase()]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 capitalize">
                  {essays[selectedEssay].scholarshipType} Scholarship Essay
                </h3>
                <p className="text-sm text-gray-500">{essays[selectedEssay].angle}</p>
              </div>
            </div>
          </div>

          {/* Essay Content */}
          <div className="prose prose-sm max-w-none mb-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {essays[selectedEssay].essay}
              </p>
            </div>
          </div>

          {/* Analysis */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Emphasized Aspects</h4>
              <ul className="space-y-1">
                {essays[selectedEssay].emphasis.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Strategic Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {essays[selectedEssay].keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reframing Explanation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">How This Was Reframed</h4>
            <p className="text-sm text-gray-700">{essays[selectedEssay].reframing}</p>
          </div>
        </div>
      )}
    </div>
  );
}

