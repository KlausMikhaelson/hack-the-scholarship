import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scholarship Optimizer - AI-Powered Application Assistant',
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
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-[#111]">Scholarship Optimizer</h1>
                <div className="flex items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
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
            </header>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
