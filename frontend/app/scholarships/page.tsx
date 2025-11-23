'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Award, Plus, ExternalLink, Search } from 'lucide-react';
import scholarshipsData from '@/data/sample_scholarships.json';

export default function ScholarshipsPage() {
  const [scholarshipUrl, setScholarshipUrl] = useState('');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);

  const handleScrapeScholarship = async () => {
    if (!scholarshipUrl.trim()) {
      alert('Please enter a scholarship URL');
      return;
    }

    setIsScrapingLoading(true);
    
    try {
      const response = await fetch('/api/scholarships/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scholarshipUrl }),
      });

      if (!response.ok) throw new Error('Scraping failed');

      const { scholarshipId } = await response.json();
      window.location.href = `/scholarships/${scholarshipId}`;
    } catch (error) {
      console.error('Scraping error:', error);
      alert('Failed to scrape scholarship. Please try again or enter manually.');
    } finally {
      setIsScrapingLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#111] mb-2">Scholarships</h1>
          <p className="text-gray-500">Browse available scholarships and start your applications</p>
        </div>

        {/* Add Scholarship Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[#111]">Add New Scholarship</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Paste a scholarship URL and we&apos;ll automatically extract the details
          </p>

          <div className="flex gap-3">
            <input
              type="url"
              value={scholarshipUrl}
              onChange={(e) => setScholarshipUrl(e.target.value)}
              placeholder="https://example.com/scholarship-details"
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
            <button
              onClick={handleScrapeScholarship}
              disabled={isScrapingLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isScrapingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Scrape Scholarship
                </>
              )}
            </button>
          </div>
        </div>

        {/* Available Scholarships */}
        <div>
          <h2 className="text-xl font-semibold text-[#111] mb-6">Available Scholarships</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarshipsData.map((scholarship) => (
              <div
                key={scholarship.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                    Preloaded
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {scholarship.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                  {scholarship.description.substring(0, 150)}...
                </p>

                <Link
                  href={`/scholarships/${scholarship.id}`}
                  className="block w-full text-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Start Application
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

