"use client";

import { useState } from "react";

export default function TestFormPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Scholarship Application Form
          </h1>
          <p className="text-gray-600 mb-8">
            Test form for browser extension - Fill out this form to test
            auto-fill functionality
          </p>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Form submitted successfully!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Academic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="gpa"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    GPA (Grade Point Average)
                  </label>
                  <input
                    type="text"
                    id="gpa"
                    name="gpa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3.75"
                  />
                </div>

                <div>
                  <label
                    htmlFor="major"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Major / Field of Study
                  </label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>

            {/* Activities & Achievements Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Activities & Achievements
              </h2>

              <div className="mt-4">
                <label
                  htmlFor="extracurriculars"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Extracurricular Activities
                </label>
                <textarea
                  id="extracurriculars"
                  name="extracurriculars"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List your extracurricular activities, clubs, sports, volunteer work, etc."
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="achievements"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Awards & Achievements
                </label>
                <textarea
                  id="achievements"
                  name="achievements"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List any awards, honors, recognitions, or accomplishments"
                />
              </div>
            </div>

            {/* Essay Section */}
            <div className="pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Statement
              </h2>

              <div className="mt-4">
                <label
                  htmlFor="essay"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Personal Statement / Essay
                </label>
                <textarea
                  id="essay"
                  name="essay"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself, your background, goals, and why you deserve this scholarship..."
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="background"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Personal Background
                </label>
                <textarea
                  id="background"
                  name="background"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your personal background, challenges overcome, and life experiences..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Testing Instructions:</strong> Use the browser extension to
            auto-fill this form. Click the extension icon and select &apos;Fill Form&apos;
            to test the form detection and filling functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
