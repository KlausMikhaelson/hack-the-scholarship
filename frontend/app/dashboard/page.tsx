'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Award, FileText, TrendingUp, Plus } from 'lucide-react';

export default function DashboardPage() {
  // Mock data - replace with actual API calls
  const stats = {
    totalApplications: 3,
    inProgress: 2,
    submitted: 1,
    scholarshipsAvailable: 12,
  };

  const recentApplications = [
    { id: '1', scholarshipName: 'Gates Millennium Scholarship', status: 'IN_PROGRESS', updatedAt: '2 hours ago' },
    { id: '2', scholarshipName: 'Google Generation Scholarship', status: 'DRAFT', updatedAt: '1 day ago' },
    { id: '3', scholarshipName: 'Coca-Cola Scholars Program', status: 'SUBMITTED', updatedAt: '3 days ago' },
  ];

  return (
    <>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#111] mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s your scholarship application overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Applications</p>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">In Progress</p>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Submitted</p>
              <Award className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.submitted}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Available</p>
              <Award className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.scholarshipsAvailable}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/scholarships"
            className="group bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-8 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Browse Scholarships</h3>
              <Award className="w-6 h-6" />
            </div>
            <p className="text-blue-100 text-sm">Find and apply to new scholarship opportunities</p>
          </Link>

          <Link
            href="/applications"
            className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">My Applications</h3>
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">View and manage your ongoing applications</p>
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#111]">Recent Applications</h2>
            <Link href="/applications" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {recentApplications.map(app => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 mb-1">{app.scholarshipName}</p>
                  <p className="text-xs text-gray-500">Updated {app.updatedAt}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'SUBMITTED'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : app.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

