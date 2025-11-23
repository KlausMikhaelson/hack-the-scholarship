"use client";

import React from "react";

export default function LoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Card 1: Personality */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-baseline gap-3 mb-6">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-100 rounded-lg"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>

      {/* Card 2: Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-baseline gap-3 mb-6">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="h-64 w-full bg-gray-100 rounded-lg"></div>
      </div>

      {/* Card 3: Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-baseline gap-3 mb-6">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 rounded w-full"></div>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center text-gray-400 text-sm pt-4">
        Analyzing scholarship profile and generating insights...
      </div>
    </div>
  );
}
