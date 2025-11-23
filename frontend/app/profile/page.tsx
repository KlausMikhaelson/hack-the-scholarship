'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useForm } from 'react-hook-form';
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
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: 'John Doe',
      email: 'john@example.com',
      gpa: '3.8',
      major: 'Computer Science',
      extracurriculars: 'Robotics Club Captain, Volunteer Tutor',
      achievements: 'National Merit Scholar, Hackathon Winner',
      personalBackground: 'First-generation college student passionate about using technology for social good.',
      writingSample: '',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Save failed');

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Navigation />
      
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    {...register('name', { required: 'Required' })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    {...register('email', { required: 'Required' })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
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
    </>
  );
}

