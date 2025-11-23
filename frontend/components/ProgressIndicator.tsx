'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

const steps = [
  { id: 1, name: 'Basics', label: 'Student Basics' },
  { id: 2, name: 'Experience', label: 'Experiences & Achievements' },
  { id: 3, name: 'Background', label: 'Personal Background' },
  { id: 4, name: 'Scholarship', label: 'Scholarship Information' },
  { id: 5, name: 'Generate', label: 'Generate Application' },
];

export default function ProgressIndicator({ currentStep, completedSteps }: ProgressIndicatorProps) {
  return (
    <div className="sticky top-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Progress</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = step.id <= currentStep || isCompleted;

            return (
              <div key={step.id} className="flex items-start gap-3">
                {/* Indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-semibold">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-1 transition-colors ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pt-1">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'text-gray-900'
                        : isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

