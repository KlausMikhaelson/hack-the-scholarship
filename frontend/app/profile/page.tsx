'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@clerk/nextjs';
import { Save, User as UserIcon } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  gpa: string;
  major: string;
  extracurriculars: string;
  achievements: string;
  personalBackground: string;
  writingSample: string;
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      email: '',
      gpa: '',
      major: '',
      extracurriculars: '',
      achievements: '',
      personalBackground: '',
      writingSample: '',
    }
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/profile');
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Profile not found. Please complete onboarding first.');
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        const profile = data.profile;
        const user = data.user || {};

        // Populate form with fetched data (use API response for name/email, fallback to Clerk)
        reset({
          name: user.name || clerkUser?.fullName || clerkUser?.firstName || '',
          email: user.email || clerkUser?.primaryEmailAddress?.emailAddress || '',
          gpa: profile.gpaString || profile.gpa?.toString() || '',
          major: profile.major || '',
          extracurriculars: profile.extracurriculars || '',
          achievements: profile.achievements || '',
          personalBackground: profile.personalBackground || '',
          writingSample: profile.writingSample || '',
        });

        setError(null);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch when auth is loaded
    if (isLoaded) {
      if (!isSignedIn) {
        // Redirect to home if not signed in
        router.push('/');
        return;
      }
      // Fetch profile even if clerkUser is not loaded yet - API will handle auth
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, router]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa: data.gpa,
          major: data.major,
          extracurriculars: data.extracurriculars,
          achievements: data.achievements,
          personalBackground: data.personalBackground,
          writingSample: data.writingSample,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Save failed');
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while auth is loading or while fetching profile
  if (!isLoaded || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">{!isLoaded ? 'Loading authentication...' : 'Loading profile...'}</p>
            </div>
          </div>
        </div>
    );
  }

  // Redirect if not signed in (handled in useEffect, but show loading while redirecting)
  if (isLoaded && !isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Redirecting...</p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium mb-2">Error loading profile</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#111]">Profile Settings</h1>
          </div>
          <p className="text-gray-500">Manage your profile information used across all applications</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111] mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    {...register('name')}
                    disabled
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Name is managed by your account settings</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    disabled
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email is managed by your account settings</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GPA *</label>
                  <input
                    {...register('gpa', { required: 'Required' })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  {errors.gpa && <p className="text-red-500 text-xs mt-1.5">{errors.gpa.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Major *</label>
                  <input
                    {...register('major', { required: 'Required' })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  {errors.major && <p className="text-red-500 text-xs mt-1.5">{errors.major.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Activities & Achievements */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111] mb-6">Activities & Achievements</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Extracurriculars *</label>
                <textarea
                  {...register('extracurriculars', { required: 'Required' })}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                />
                {errors.extracurriculars && <p className="text-red-500 text-xs mt-1.5">{errors.extracurriculars.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Achievements *</label>
                <textarea
                  {...register('achievements', { required: 'Required' })}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                />
                {errors.achievements && <p className="text-red-500 text-xs mt-1.5">{errors.achievements.message}</p>}
              </div>
            </div>
          </div>

          {/* Personal Background */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111] mb-6">Personal Background</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Story *</label>
                <textarea
                  {...register('personalBackground', { required: 'Required' })}
                  rows={6}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                />
                {errors.personalBackground && <p className="text-red-500 text-xs mt-1.5">{errors.personalBackground.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Writing Sample (Optional)</label>
                <textarea
                  {...register('writingSample')}
                  rows={6}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                  placeholder="Optional: paste a writing sample for tone matching"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
  );
}

