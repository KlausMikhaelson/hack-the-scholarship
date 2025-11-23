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
  merit: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  service: 'bg-blue-50 text-blue-700 border-blue-200',
  leadership: 'bg-amber-50 text-amber-700 border-amber-200',
  innovation: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ComparativeEssays({ essays, comparison }: ComparativeEssaysProps) {
  const [selectedEssay, setSelectedEssay] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Comparative Essay Analysis
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          See how the same student profile is reframed for different scholarship types. 
          This demonstrates the power of adaptive essay generation.
        </p>
      </div>

      {/* Comparison Overview */}
      {comparison.howSameStory && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How the Same Story is Told Differently</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-6">{comparison.howSameStory}</p>
          
          {comparison.keyDifferences && comparison.keyDifferences.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Key Differences:</h4>
              <ul className="space-y-2">
                {comparison.keyDifferences.map((diff: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-emerald-600 mt-1 font-bold">•</span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {comparison.strategicChoices && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Strategic Choices:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{comparison.strategicChoices}</p>
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
            className={`p-5 rounded-2xl border-2 transition-all text-left ${
              selectedEssay === index
                ? `${typeColors[essay.scholarshipType.toLowerCase()]} border-current shadow-md scale-105`
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedEssay === index ? typeColors[essay.scholarshipType.toLowerCase()] : 'bg-gray-50 border border-gray-200'}`}>
                {typeIcons[essay.scholarshipType.toLowerCase()]}
              </div>
              <span className="font-bold capitalize text-base">{essay.scholarshipType}</span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{essay.angle}</p>
          </button>
        ))}
      </div>

      {/* Selected Essay Display */}
      {essays[selectedEssay] && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${typeColors[essays[selectedEssay].scholarshipType.toLowerCase()]}`}>
                {typeIcons[essays[selectedEssay].scholarshipType.toLowerCase()]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 capitalize mb-1">
                  {essays[selectedEssay].scholarshipType} Scholarship Essay
                </h3>
                <p className="text-sm text-gray-600">{essays[selectedEssay].angle}</p>
              </div>
            </div>
          </div>

          {/* Essay Content */}
          <div className="prose prose-sm max-w-none mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {essays[selectedEssay].essay}
              </p>
            </div>
          </div>

          {/* Analysis */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Emphasized Aspects</h4>
              <ul className="space-y-2">
                {essays[selectedEssay].emphasis.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-emerald-600 mt-1 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Strategic Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {essays[selectedEssay].keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-semibold border border-emerald-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reframing Explanation */}
          <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
            <h4 className="text-sm font-bold text-gray-900 mb-3">How This Was Reframed</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{essays[selectedEssay].reframing}</p>
          </div>
        </div>
      )}
    </div>
  );
}

