"use client";

import React from "react";
import { StrengthMapping } from "@/types";

interface StrengthMappingTableProps {
  mappings: StrengthMapping[];
}

export default function StrengthMappingTable({
  mappings,
}: StrengthMappingTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Step 3
        </span>
        <h3 className="text-lg font-semibold text-[#111]">
          Student Strength Mapping
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-6 ml-[70px]">
        How your profile aligns with scholarship values based on your
        experience.
      </p>

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Scholarship Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Student Strength
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Evidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mappings.map((mapping, index) => (
              <tr
                key={index}
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {mapping.scholarshipValue}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {mapping.studentStrength}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 italic">
                  &quot;{mapping.evidence}&quot;
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
