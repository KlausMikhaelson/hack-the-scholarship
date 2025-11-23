import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Award, Home, FileText, User, GitCompare } from 'lucide-react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scholarly - AI-Powered Scholarship Assistant',
  description: 'AI-powered scholarship analysis, tailored essay generation, and explainable targeting for students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-[#fafafa]" style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {/* Floating Navigation Header */}
            <header className="fixed top-4 left-4 right-4 z-50">
              <div className="max-w-7xl mx-auto">
                <nav className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg px-6 py-3">
                  <div className="flex items-center justify-between">
                    {/* Left: Logo + Title */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl font-bold text-[#111]">Scholarly</span>
                    </Link>

                    {/* Center: Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-all"
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/scholarships"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-all"
                      >
                        <Award className="w-4 h-4" />
                        Scholarships
                      </Link>
                      <Link
                        href="/applications"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Applications
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-all"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/compare"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-all"
                      >
                        <GitCompare className="w-4 h-4" />
                        Compare
                      </Link>
                    </div>

                    {/* Right: Auth Buttons */}
                    <div className="flex items-center gap-3">
                      <SignedOut>
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                          <button className="px-4 py-2 text-sm font-semibold bg-[#111] text-white rounded-xl hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </SignedOut>
                      <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                      </SignedIn>
                    </div>
                  </div>
                </nav>
              </div>
            </header>

            {/* Page Content - with top padding to account for floating header */}
            <div className="pt-24">
              {children}
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
