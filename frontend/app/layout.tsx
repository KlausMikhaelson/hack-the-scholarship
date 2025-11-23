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
            {/* Unified Navigation Header */}
            <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
              <div className="w-full px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  {/* Left: Logo + Title */}
                  <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#111]">Scholarly</span>
                  </Link>

                  {/* Center: Navigation Links */}
                  <nav className="hidden md:flex items-center gap-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/scholarships"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      Scholarships
                    </Link>
                    <Link
                      href="/applications"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Applications
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/compare"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <GitCompare className="w-4 h-4" />
                      Compare
                    </Link>
                  </nav>

                  {/* Right: Auth Buttons */}
                  <div className="flex items-center gap-4">
                    <SignedOut>
                      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                        <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content - with top padding to account for fixed header */}
            <div className="pt-[73px]">
              {children}
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
