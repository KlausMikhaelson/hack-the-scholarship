'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { OnboardingFormData } from '@/types';
import { Check } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { register, watch, formState: { errors }, handleSubmit } = useForm<OnboardingFormData>({
    defaultValues: {
      name: '',
      email: '',
      gpa: '',
      major: '',
      extracurriculars: '',
      achievements: '',
      personalBackground: '',
      writingSample: '',
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Check step completion
  const isStep1Complete = watchedValues.name && watchedValues.email && watchedValues.gpa && watchedValues.major;
  const isStep2Complete = watchedValues.extracurriculars && watchedValues.achievements;
  const isStep3Complete = watchedValues.personalBackground;

  // Auto-advance
  useEffect(() => {
    if (currentStep === 1 && isStep1Complete && !completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
      setCurrentStep(2);
    }
  }, [isStep1Complete, currentStep, completedSteps]);

  useEffect(() => {
    if (currentStep === 2 && isStep2Complete && !completedSteps.includes(2)) {
      setCompletedSteps(prev => [...prev, 2]);
      setCurrentStep(3);
    }
  }, [isStep2Complete, currentStep, completedSteps]);

  useEffect(() => {
    if (currentStep === 3 && isStep3Complete && !completedSteps.includes(3)) {
      setCompletedSteps(prev => [...prev, 3]);
      setCurrentStep(4);
    }
  }, [isStep3Complete, currentStep, completedSteps]);

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#111] mb-3">Welcome to Scholarship Optimizer</h1>
          <p className="text-gray-500">Let&apos;s set up your profile to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  completedSteps.includes(step)
                    ? 'bg-blue-600 text-white'
                    : currentStep === step
                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {completedSteps.includes(step) ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    completedSteps.includes(step) ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Basics</span>
            <span>Activities</span>
            <span>Background</span>
            <span>Writing</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#111] mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                    })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
                    GPA *
                  </label>
                  <input
                    {...register('gpa', { 
                      required: 'GPA is required',
                      pattern: { value: /^[0-4](\.\d{1,2})?$/, message: 'Enter valid GPA (0.0-4.0)' }
                    })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="3.8"
                  />
                  {errors.gpa && <p className="text-red-500 text-xs mt-1.5">{errors.gpa.message}</p>}
                </div>

                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
                    Major *
                  </label>
                  <input
                    {...register('major', { required: 'Major is required' })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="Computer Science"
                  />
                  {errors.major && <p className="text-red-500 text-xs mt-1.5">{errors.major.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Activities */}
          {currentStep >= 2 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mt-6">
              <h2 className="text-xl font-semibold text-[#111] mb-6">Activities & Achievements</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="extracurriculars" className="block text-sm font-medium text-gray-700 mb-2">
                    Extracurricular Activities *
                  </label>
                  <textarea
                    {...register('extracurriculars', { required: 'Required' })}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                    placeholder="List your clubs, sports, volunteer work..."
                  />
                  {errors.extracurriculars && <p className="text-red-500 text-xs mt-1.5">{errors.extracurriculars.message}</p>}
                </div>

                <div>
                  <label htmlFor="achievements" className="block text-sm font-medium text-gray-700 mb-2">
                    Achievements & Awards *
                  </label>
                  <textarea
                    {...register('achievements', { required: 'Required' })}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                    placeholder="List your awards, honors, recognitions..."
                  />
                  {errors.achievements && <p className="text-red-500 text-xs mt-1.5">{errors.achievements.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Background */}
          {currentStep >= 3 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mt-6">
              <h2 className="text-xl font-semibold text-[#111] mb-6">Personal Background</h2>
              
              <div>
                <label htmlFor="personalBackground" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Story *
                </label>
                <textarea
                  {...register('personalBackground', { required: 'Required' })}
                  rows={6}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                  placeholder="Share your story, challenges overcome, motivations, community involvement..."
                />
                {errors.personalBackground && <p className="text-red-500 text-xs mt-1.5">{errors.personalBackground.message}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Writing Sample */}
          {currentStep >= 4 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mt-6">
              <h2 className="text-xl font-semibold text-[#111] mb-6">Writing Sample (Optional)</h2>
              
              <div>
                <label htmlFor="writingSample" className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Essay or Personal Statement
                </label>
                <textarea
                  {...register('writingSample')}
                  rows={8}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                  placeholder="Optional: paste a generic essay for tone matching..."
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow"
                >
                  Complete Profile & Continue
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

