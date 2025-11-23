'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import PipelineOutput from '@/components/PipelineOutput';
import LoadingState from '@/components/LoadingState';
import { Scholarship, UserProfile, PipelineResult } from '@/types';
import { Award, User as UserIcon, ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';
import scholarshipsData from '@/data/sample_scholarships.json';

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scholarshipId = params.id as string;

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);

  useEffect(() => {
    // Load scholarship
    const found = scholarshipsData.find(s => s.id === scholarshipId);
    if (found) {
      setScholarship({
        id: found.id,
        name: found.name,
        description: found.description,
        isPreloaded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Load user profile (mock for now)
    setUserProfile({
      id: 'mock-profile-id',
      userId: 'mock-user-id',
      gpa: '3.8',
      major: 'Computer Science',
      extracurriculars: 'Robotics Club Captain, Volunteer Tutor',
      achievements: 'National Merit Scholar, Hackathon Winner',
      personalBackground: 'First-generation college student passionate about using technology for social good.',
      writingSample: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [scholarshipId]);

  const handleGenerateApplication = async () => {
    if (!scholarship || !userProfile) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/applications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarshipId: scholarship.id,
          profileId: userProfile.id,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const result = await response.json();
      setPipelineResult(result);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!scholarship || !userProfile) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/applications/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarshipId: scholarship.id,
          profileId: userProfile.id,
        }),
      });

      if (!response.ok) throw new Error('Regeneration failed');

      const { essay } = await response.json();
      if (pipelineResult) {
        setPipelineResult({ ...pipelineResult, tailoredEssay: essay });
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      alert('Failed to regenerate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!scholarship) {
    return (
      <>
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-500">Loading scholarship...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scholarships
          </Link>
          
          <h1 className="text-3xl font-bold text-[#111] mb-4">{scholarship.name}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scholarship Description */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#111] mb-4">Scholarship Details</h2>
              <div className="prose prose-sm prose-gray max-w-none">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {scholarship.description}
                </p>
              </div>
            </div>

            {/* Generate or Show Results */}
            {!pipelineResult && !isLoading && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
                <h3 className="text-lg font-semibold text-[#111] mb-2">Ready to Generate?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We&apos;ll use your profile to create a tailored application for this scholarship
                </p>
                <button
                  onClick={handleGenerateApplication}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Generate Tailored Essay
                </button>
              </div>
            )}

            {isLoading && <LoadingState />}

            {pipelineResult && !isLoading && (
              <PipelineOutput result={pipelineResult} onRegenerate={handleRegenerate} />
            )}
          </div>

          {/* Sidebar - User Profile Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Your Profile</h3>
              </div>

              {userProfile && (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">GPA</p>
                    <p className="font-medium text-gray-900">{userProfile.gpa}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Major</p>
                    <p className="font-medium text-gray-900">{userProfile.major}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Activities</p>
                    <p className="text-gray-700 text-xs line-clamp-2">{userProfile.extracurriculars}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Achievements</p>
                    <p className="text-gray-700 text-xs line-clamp-2">{userProfile.achievements}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="block w-full text-center px-4 py-2 mt-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

