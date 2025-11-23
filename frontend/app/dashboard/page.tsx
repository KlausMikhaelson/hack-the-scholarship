'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Award, FileText, TrendingUp, Plus, Zap } from 'lucide-react';

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
  readyToFill?: boolean;
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
      <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-500">{!authLoaded ? 'Loading authentication...' : 'Loading dashboard...'}</p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-red-800 font-semibold mb-2">Error loading dashboard</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
            >
              Retry
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#111] mb-3">Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back! Here&apos;s your scholarship application overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center border border-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Submitted</p>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.submitted}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Available</p>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center border border-amber-100">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.scholarshipsAvailable}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/scholarships"
            className="group bg-[#111] hover:bg-[#1a1a1a] text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">Browse Scholarships</h3>
              <Award className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-gray-300 text-sm">Find and apply to new scholarship opportunities</p>
          </Link>

          <Link
            href="/applications"
            className="group bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">My Applications</h3>
              <FileText className="w-6 h-6 text-gray-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-gray-600 text-sm">View and manage your ongoing applications</p>
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#111]">Recent Applications</h2>
            <Link href="/applications" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">No applications yet</p>
                <p className="text-gray-500 text-sm mb-4">Start applying to scholarships to see them here</p>
                <Link
                  href="/scholarships"
                  className="inline-block px-6 py-2 bg-[#111] text-white rounded-xl hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md text-sm font-medium"
                >
                  Browse scholarships →
                </Link>
              </div>
            ) : (
              recentApplications.map(app => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between p-5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{app.scholarshipName}</p>
                      {app.readyToFill && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                          <Zap className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Updated {app.updatedAt}</p>
                  </div>
                  <div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                      app.status === 'SUBMITTED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
  );
}

