'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { StudentProfile } from '@/types';

interface StudentFormProps {
  register: UseFormRegister<StudentProfile>;
  errors: FieldErrors<StudentProfile>;
}

export default function StudentForm({ register, errors }: StudentFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-2 text-[#111]">Student Profile</h2>
      <p className="text-sm text-gray-500 mb-8">
        Tell us about your academic background and achievements.
      </p>
      
      <div className="space-y-6">
        {/* Name & GPA Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
              GPA *
            </label>
            <input
              id="gpa"
              type="text"
              {...register('gpa', { 
                required: 'GPA is required',
                pattern: {
                  value: /^[0-4](\.\d{1,2})?$/,
                  message: 'Please enter a valid GPA (0.0-4.0)'
                }
              })}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400"
              placeholder="3.8"
            />
            {errors.gpa && (
              <p className="text-red-500 text-xs mt-1.5">{errors.gpa.message}</p>
            )}
          </div>
        </div>

        {/* Major */}
        <div>
          <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
            Major / Intended Field of Study *
          </label>
          <input
            id="major"
            type="text"
            {...register('major', { required: 'Major is required' })}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400"
            placeholder="Computer Science"
          />
          {errors.major && (
            <p className="text-red-500 text-xs mt-1.5">{errors.major.message}</p>
          )}
        </div>

        {/* Extracurriculars */}
        <div>
          <label htmlFor="extracurriculars" className="block text-sm font-medium text-gray-700 mb-2">
            Extracurricular Activities *
          </label>
          <textarea
            id="extracurriculars"
            {...register('extracurriculars', { required: 'Extracurriculars are required' })}
            rows={4}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400 resize-y"
            placeholder="List your extracurricular activities, clubs, sports, volunteer work, etc."
          />
          {errors.extracurriculars && (
            <p className="text-red-500 text-xs mt-1.5">{errors.extracurriculars.message}</p>
          )}
        </div>

        {/* Achievements */}
        <div>
          <label htmlFor="achievements" className="block text-sm font-medium text-gray-700 mb-2">
            Achievements & Awards *
          </label>
          <textarea
            id="achievements"
            {...register('achievements', { required: 'Achievements are required' })}
            rows={4}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400 resize-y"
            placeholder="List your achievements, awards, honors, recognitions, etc."
          />
          {errors.achievements && (
            <p className="text-red-500 text-xs mt-1.5">{errors.achievements.message}</p>
          )}
        </div>

        {/* Personal Background */}
        <div>
          <label htmlFor="personalBackground" className="block text-sm font-medium text-gray-700 mb-2">
            Personal Background *
          </label>
          <textarea
            id="personalBackground"
            {...register('personalBackground', { required: 'Personal background is required' })}
            rows={5}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400 resize-y"
            placeholder="Share your story: challenges, motivations, community involvement, family background..."
          />
          {errors.personalBackground && (
            <p className="text-red-500 text-xs mt-1.5">{errors.personalBackground.message}</p>
          )}
        </div>

        {/* Writing Sample (Optional) */}
        <div>
          <label htmlFor="writingSample" className="block text-sm font-medium text-gray-700 mb-2">
            Writing Sample (Optional)
          </label>
          <textarea
            id="writingSample"
            {...register('writingSample')}
            rows={6}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400 resize-y"
            placeholder="Paste a generic essay or personal statement (optional for comparison)"
          />
        </div>
      </div>
    </div>
  );
}
