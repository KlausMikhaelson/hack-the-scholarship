'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Award, FileText, TrendingUp, Plus } from 'lucide-react';

interface DashboardStats {
  totalApplications: number;
  inProgress: number;
  submitted: number;
  scholarshipsAvailable: number;
}

interface RecentApplication {
  id: string;
  scholarshipName: string;
  status: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded: authLoaded } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    inProgress: 0,
    submitted: 0,
    scholarshipsAvailable: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch when auth is loaded
    if (!authLoaded) return;

    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        // Check if user needs to complete onboarding
        if (data.needsOnboarding) {
          router.push('/onboarding');
          return;
        }

        setStats(data.stats);
        setRecentApplications(data.recentApplications || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [authLoaded, router]);

  if (!authLoaded || isLoading) {
    return (
      <>
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">{!authLoaded ? 'Loading authentication...' : 'Loading dashboard...'}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium mb-2">Error loading dashboard</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

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
        <div className="grid md:grid-cols-4 gap-6 mb-6">
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
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No applications yet</p>
                <Link
                  href="/scholarships"
                  className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  Browse scholarships →
                </Link>
              </div>
            ) : (
              recentApplications.map(app => (
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
                        : app.status === 'DRAFT'
                        ? 'bg-gray-50 text-gray-700 border border-gray-200'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

