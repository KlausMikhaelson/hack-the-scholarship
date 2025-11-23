'use client';

import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { ScholarshipInput as ScholarshipInputType } from '@/types';
import scholarships from '@/data/sample_scholarships.json';
import { FileText, List } from 'lucide-react';

interface ScholarshipInputProps {
  register: UseFormRegister<ScholarshipInputType>;
  setValue: UseFormSetValue<ScholarshipInputType>;
  errors: FieldErrors<ScholarshipInputType>;
}

export default function ScholarshipInput({ register, setValue, errors }: ScholarshipInputProps) {
  const [inputMethod, setInputMethod] = useState<'paste' | 'select'>('paste');

  const handleScholarshipSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setValue('selectedScholarshipId', selectedId);
    
    if (selectedId) {
      const selected = scholarships.find(s => s.id === selectedId);
      if (selected) {
        setValue('name', selected.name);
        setValue('description', selected.description);
      }
    } else {
      setValue('name', '');
      setValue('description', '');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-2 text-[#111]">Scholarship Information</h2>
      <p className="text-sm text-gray-500 mb-8">
        Provide details about the scholarship you want to apply for.
      </p>

      {/* Input Method Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-lg mb-8 w-fit">
        <button
          type="button"
          onClick={() => setInputMethod('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputMethod === 'paste'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Description
        </button>
        <button
          type="button"
          onClick={() => setInputMethod('select')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputMethod === 'select'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List className="w-4 h-4" />
          Select Sample
        </button>
      </div>

      <div className="space-y-6">
        {/* Sample Scholarship Selector */}
        {inputMethod === 'select' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label htmlFor="sampleScholarship" className="block text-sm font-medium text-gray-700 mb-2">
              Select a Sample Scholarship
            </label>
            <select
              id="sampleScholarship"
              onChange={handleScholarshipSelect}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            >
              <option value="">-- Choose a scholarship --</option>
              {scholarships.map(scholarship => (
                <option key={scholarship.id} value={scholarship.id}>
                  {scholarship.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Scholarship Name */}
        <div>
          <label htmlFor="scholarshipName" className="block text-sm font-medium text-gray-700 mb-2">
            Scholarship Name *
          </label>
          <input
            id="scholarshipName"
            type="text"
            {...register('name', { required: 'Scholarship name is required' })}
            className={`w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400 ${
              inputMethod === 'select' ? 'bg-gray-50 text-gray-500' : ''
            }`}
            placeholder="Enter scholarship name"
            readOnly={inputMethod === 'select'}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
          )}
        </div>

        {/* Scholarship Description */}
        <div>
          <label htmlFor="scholarshipDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Scholarship Description *
          </label>
          <textarea
            id="scholarshipDescription"
            {...register('description', { required: 'Scholarship description is required' })}
            rows={12}
            className={`w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400 resize-y ${
              inputMethod === 'select' ? 'bg-gray-50 text-gray-500' : ''
            }`}
            placeholder="Paste the full scholarship description, requirements, and criteria here..."
            readOnly={inputMethod === 'select'}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
