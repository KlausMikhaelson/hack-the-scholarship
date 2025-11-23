'use client';

import React from 'react';
import { ExplainabilityRow } from '@/types';

interface ExplainabilityTableProps {
  rows: ExplainabilityRow[];
}

export default function ExplainabilityTable({ rows }: ExplainabilityTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Step 5</span>
        <h3 className="text-lg font-semibold text-[#111]">Explainability Matrix</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6 ml-[70px]">
        Transparent breakdown of how each value was weighted and addressed.
      </p>

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/12">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                Why It Matters
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                How Student Meets It
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr 
                key={index} 
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                  {row.value}
                </td>
                <td className="px-6 py-4 text-sm align-top">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {(row.weight * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 align-top leading-relaxed">
                  {row.whyItMatters}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 align-top leading-relaxed">
                  {row.howStudentMeetsIt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

