"use client";

import React from "react";
import { ScholarshipPersonality as ScholarshipPersonalityType } from "@/types";
import { CheckCircle2, Target, Eye } from "lucide-react";

interface ScholarshipPersonalityProps {
  personality: ScholarshipPersonalityType;
}

export default function ScholarshipPersonality({
  personality,
}: ScholarshipPersonalityProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Step 1
        </span>
        <h3 className="text-lg font-semibold text-[#111]">
          Scholarship Personality
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-6 ml-[70px]">
        Extracted values and hidden patterns from the scholarship description.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Extracted Values */}
        <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-gray-700" />
            </div>
            <h4 className="font-medium text-gray-900 text-sm">
              Extracted Values
            </h4>
          </div>
          <ul className="space-y-3">
            {personality.extractedValues.map((value, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-blue-500 mt-1.5 text-[10px]">●</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Themes */}
        <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm">
              <Target className="w-4 h-4 text-gray-700" />
            </div>
            <h4 className="font-medium text-gray-900 text-sm">
              Priority Themes
            </h4>
          </div>
          <ul className="space-y-3">
            {personality.priorityThemes.map((theme, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-blue-500 mt-1.5 text-[10px]">●</span>
                <span>{theme}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hidden Patterns */}
        <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm">
              <Eye className="w-4 h-4 text-gray-700" />
            </div>
            <h4 className="font-medium text-gray-900 text-sm">
              Hidden Patterns
            </h4>
          </div>
          <ul className="space-y-3">
            {personality.hiddenPatterns.map((pattern, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-blue-500 mt-1.5 text-[10px]">●</span>
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
