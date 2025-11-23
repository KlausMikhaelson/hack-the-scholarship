'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, Archive, Loader2 } from 'lucide-react';

interface Application {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  progress: number;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (err) {
        console.error('Applications fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, []);

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
      case 'SUBMITTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ARCHIVED': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
              <p className="text-gray-600 font-medium">Loading applications...</p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Retry
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#111] mb-3">My Applications</h1>
          <p className="text-lg text-gray-600">Track and manage your scholarship applications</p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map(app => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="group block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-emerald-600 transition-colors">{app.scholarshipName}</h3>
                  <p className="text-sm text-gray-500">Last updated {formatDate(app.updatedAt)}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)}
                  {app.status.replace('_', ' ')}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2 font-medium">
                  <span>Progress</span>
                  <span>{app.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all shadow-sm"
                    style={{ width: `${app.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">Start by browsing available scholarships</p>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Browse Scholarships
            </Link>
          </div>
        )}
        </div>
    );
  }

