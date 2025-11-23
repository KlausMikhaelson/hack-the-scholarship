'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, Archive } from 'lucide-react';

export default function ApplicationsPage() {
  // Mock data - replace with actual API
  const applications = [
    {
      id: '1',
      scholarshipName: 'Gates Millennium Scholarship',
      status: 'IN_PROGRESS',
      updatedAt: '2 hours ago',
      progress: 75,
    },
    {
      id: '2',
      scholarshipName: 'Google Generation Scholarship',
      status: 'DRAFT',
      updatedAt: '1 day ago',
      progress: 30,
    },
    {
      id: '3',
      scholarshipName: 'Coca-Cola Scholars Program',
      status: 'SUBMITTED',
      updatedAt: '3 days ago',
      progress: 100,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      case 'SUBMITTED': return <CheckCircle className="w-4 h-4" />;
      case 'ARCHIVED': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SUBMITTED': return 'bg-green-50 text-green-700 border-green-200';
      case 'ARCHIVED': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#111] mb-2">My Applications</h1>
          <p className="text-gray-500">Track and manage your scholarship applications</p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map(app => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{app.scholarshipName}</h3>
                  <p className="text-sm text-gray-500">Last updated {app.updatedAt}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)}
                  {app.status.replace('_', ' ')}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{app.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${app.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6">Start by browsing available scholarships</p>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Scholarships
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

