'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Plus, ExternalLink, Search } from 'lucide-react';

interface Scholarship {
  id: string;
  name: string;
  description: string;
  deadline?: string;
  sourceUrl?: string;
  isPreloaded: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ScholarshipsPage() {
  const [scholarshipUrl, setScholarshipUrl] = useState('');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [matched, setMatched] = useState(false);
  const [totalMatched, setTotalMatched] = useState(0);

  // Fetch scholarships from API
  useEffect(() => {
    async function fetchScholarships() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/scholarships');
        
        if (!response.ok) {
          throw new Error('Failed to fetch scholarships');
        }

        const data = await response.json();
        setScholarships(data.scholarships || []);
        setHasProfile(data.hasProfile || false);
        setMatched(data.matched || false);
        setTotalMatched(data.totalMatched || 0);
      } catch (err) {
        console.error('Scholarships fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scholarships');
      } finally {
        setIsLoading(false);
      }
    }

    fetchScholarships();
  }, []);

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
      
      // Clear the input
      setScholarshipUrl('');
      
      // Refresh the scholarships list
      const refreshResponse = await fetch('/api/scholarships');
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setScholarships(data.scholarships || []);
        setHasProfile(data.hasProfile || false);
        setMatched(data.matched || false);
        setTotalMatched(data.totalMatched || 0);
      }
      
      // Navigate to the new scholarship
      window.location.href = `/scholarships/${scholarshipId}`;
    } catch (error) {
      console.error('Scraping error:', error);
      alert('Failed to scrape scholarship. Please try again or enter manually.');
    } finally {
      setIsScrapingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#111] mb-3">Scholarships</h1>
          <p className="text-lg text-gray-600">Browse available scholarships and start your applications</p>
        </div>

        {/* Add Scholarship Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <Plus className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-[#111]">Add New Scholarship</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Paste a scholarship URL and we&apos;ll automatically extract the details
          </p>

          <div className="flex gap-3">
            <input
              type="url"
              value={scholarshipUrl}
              onChange={(e) => setScholarshipUrl(e.target.value)}
              placeholder="https://example.com/scholarship-details"
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
            <button
              onClick={handleScrapeScholarship}
              disabled={isScrapingLoading}
              className="px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
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

        {/* Profile Banner */}
        {!hasProfile && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-200">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Connect Your Profile to See Better Matches
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete your profile to see scholarships that match your GPA, major, student status, and other criteria. 
                  You&apos;ll have better chances at scholarships tailored to your profile!
                </p>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  Complete Profile
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Matched Scholarships Header */}
        {hasProfile && matched && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-[#111]">Matched Scholarships</h2>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold border border-emerald-200">
                {totalMatched} match{totalMatched !== 1 ? 'es' : ''} found
              </span>
            </div>
            <p className="text-sm text-gray-600">
              These scholarships match your profile based on your GPA, major, student status, and other criteria.
            </p>
          </div>
        )}

        {/* No Matches Message */}
        {hasProfile && !matched && scholarships.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>No personalized matches found.</strong> Showing all available scholarships. 
              Consider updating your profile to improve matching accuracy.
            </p>
          </div>
        )}

        {/* General Scholarships Header */}
        {hasProfile && !matched && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#111] mb-2">Available Scholarships</h2>
          </div>
        )}

        {/* Available Scholarships */}
        <div>
          {!hasProfile && (
            <h2 className="text-2xl font-bold text-[#111] mb-6">Available Scholarships</h2>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600 font-medium">Loading scholarships...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
              <p className="text-red-600 mb-4 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Retry
              </button>
            </div>
          ) : scholarships.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 mb-2 font-semibold text-lg">No scholarships found</p>
              <p className="text-sm text-gray-600 mb-6">
                The database is empty. Add a new scholarship using the form above, or seed sample data to get started.
              </p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/scholarships/seed', { method: 'POST' });
                    const data = await response.json();
                    if (response.ok) {
                      alert(data.message || 'Sample scholarships seeded successfully!');
                      window.location.reload();
                    } else {
                      alert(data.error || 'Failed to seed scholarships');
                    }
                  } catch (err) {
                    console.error('Seed error:', err);
                    alert('Failed to seed scholarships');
                  }
                }}
                className="px-6 py-2.5 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Seed Sample Scholarships
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center border border-emerald-100">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      scholarship.isPreloaded 
                        ? 'bg-gray-100 text-gray-600 border border-gray-200' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {scholarship.isPreloaded ? 'Preloaded' : 'Scraped'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg group-hover:text-emerald-600 transition-colors">
                    {scholarship.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {scholarship.description.length > 150 
                      ? `${scholarship.description.substring(0, 150)}...` 
                      : scholarship.description}
                  </p>

                  {scholarship.deadline && (
                    <p className="text-xs text-gray-500 mb-4 font-medium">
                      Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  )}

                  <Link
                    href={`/scholarships/${scholarship.id}`}
                    className="block w-full text-center px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    Start Application
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

