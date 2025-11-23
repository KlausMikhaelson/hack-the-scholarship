'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PipelineOutput from '@/components/PipelineOutput';
import LoadingState from '@/components/LoadingState';
import { Scholarship, UserProfile, PipelineResult } from '@/types';
import { Award, User as UserIcon, ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scholarshipId = params.id as string;

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingData(true);
        setError(null);

        // Fetch scholarship from API
        const scholarshipResponse = await fetch(`/api/scholarships/${scholarshipId}`);
        if (!scholarshipResponse.ok) {
          if (scholarshipResponse.status === 404) {
            throw new Error('Scholarship not found');
          }
          throw new Error('Failed to fetch scholarship');
        }
        const scholarshipData = await scholarshipResponse.json();
        setScholarship(scholarshipData.scholarship);

        // Fetch user profile from API
        const profileResponse = await fetch('/api/users/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData.profile);
        } else if (profileResponse.status === 404) {
          // Profile not found - user needs to complete onboarding
          setError('Please complete your profile first');
          setIsLoadingData(false);
          return;
        }

        // Check for existing application
        const applicationsResponse = await fetch('/api/applications');
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          const existingApp = applicationsData.applications?.find(
            (app: any) => app.scholarshipId === scholarshipId
          );
          
          if (existingApp) {
            setExistingApplication(existingApp);
            setApplicationId(existingApp.id);
            
            // Fetch full application details
            const appDetailResponse = await fetch(`/api/applications/${existingApp.id}`);
            if (appDetailResponse.ok) {
              const appDetailData = await appDetailResponse.json();
              const app = appDetailData.application;
              
              // Convert application to pipeline result format
              setPipelineResult({
                scholarshipPersonality: app.scholarshipPersonality || {},
                adaptiveWeights: app.adaptiveWeights || [],
                strengthMapping: app.strengthMapping || [],
                tailoredEssay: app.editedEssay || app.generatedEssay || '',
                explainability: app.explainabilityMatrix || [],
                originalSample: undefined,
                // @ts-ignore
                explanation: {},
              });
            }
          }
        }
      } catch (err) {
        console.error('Data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    }

    if (scholarshipId) {
      fetchData();
    }
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
      
      // Update application ID if returned
      if (result.applicationId) {
        setApplicationId(result.applicationId);
        setExistingApplication({ id: result.applicationId, scholarshipId });
      }
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

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading scholarship...</p>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Scholarship not found'}</p>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Scholarships
            </Link>
          </div>
        </div>
    );
  }

  return (
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
                {existingApplication ? (
                  <>
                    <h3 className="text-lg font-semibold text-[#111] mb-2">Application Found</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      You have an existing application for this scholarship. You can edit it or generate a new version.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link
                        href={`/applications/${existingApplication.id}`}
                        className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow inline-flex items-center gap-2"
                      >
                        Edit Application
                      </Link>
                      <button
                        onClick={handleGenerateApplication}
                        className="h-12 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all shadow-sm hover:shadow inline-flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Regenerate Essay
                      </button>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}

            {isLoading && <LoadingState />}

            {pipelineResult && !isLoading && (
              <div className="space-y-4">
                {applicationId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Application Created</p>
                      <p className="text-xs text-blue-700 mt-1">
                        You can edit your essay or view full details
                      </p>
                    </div>
                    <Link
                      href={`/applications/${applicationId}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit Application
                    </Link>
                  </div>
                )}
                <PipelineOutput result={pipelineResult} onRegenerate={handleRegenerate} />
              </div>
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
  );
}

