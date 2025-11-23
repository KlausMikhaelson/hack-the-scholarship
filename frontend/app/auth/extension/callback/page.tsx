'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

// Prevent static generation - this page requires client-side auth
export const dynamic = 'force-dynamic';

function CallbackContent() {
  const { getToken, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    async function handleCallback() {
      if (!isLoaded) return;

      try {
        const token = await getToken();
        
        if (!token) {
          setStatus('Authentication failed. Please try again.');
          return;
        }

        // If redirect_url is provided (extension callback), send token to extension
        if (redirectUrl && redirectUrl.startsWith('chrome-extension://')) {
          setStatus('Sending token to extension...');
          
          // Extract extension ID from redirect URL
          const extensionIdMatch = redirectUrl.match(/chrome-extension:\/\/([^/]+)/);
          if (extensionIdMatch) {
            const extensionId = extensionIdMatch[1];
            
            // Try multiple methods to send token to extension
            // Method 1: Direct postMessage (for content script)
            window.postMessage({
              type: 'CLERK_EXTENSION_AUTH',
              token: token,
              extensionId: extensionId
            }, window.location.origin);
            
            // Method 2: Store in localStorage temporarily (content script can read it)
            try {
              localStorage.setItem('extensionAuthToken', token);
              localStorage.setItem('extensionAuthTimestamp', Date.now().toString());
            } catch (e) {
              console.error('Failed to store token in localStorage:', e);
            }
            
            setStatus('Authentication successful! Closing window...');
            
            // Close window immediately
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            setStatus('Invalid extension URL');
          }
        } else {
          // Normal web redirect
          window.location.href = redirectUrl || '/dashboard';
        }
      } catch (error) {
        console.error('Extension callback error:', error);
        setStatus('Authentication error. Please try again.');
      }
    }

    handleCallback();
  }, [getToken, isLoaded, redirectUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center max-w-md px-6">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Completing Authentication</h2>
          <p className="text-sm text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
}

export default function ExtensionCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center max-w-md px-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-sm text-gray-600">Preparing authentication...</p>
          </div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}

