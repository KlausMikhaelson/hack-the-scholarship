import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#fafafa]" style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
