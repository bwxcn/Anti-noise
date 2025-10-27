import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function AuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash
        const searchParams = new URLSearchParams(window.location.search)
        
        console.log('Auth callback - processing hash:', hashFragment)
        console.log('Auth callback - processing search params:', searchParams.toString())

        // Handle OAuth callback with access_token in hash
        if (hashFragment && hashFragment.includes('#access_token=')) {
          // Extract the access token from the hash
          const url = new URL(window.location.href)
          const accessToken = url.hash.split('#access_token=')[1]?.split('&')[0]
          const refreshToken = url.hash.split('refresh_token=')[1]?.split('&')[0]
          
          if (accessToken && refreshToken) {
            // Set the session manually
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) {
              console.error('Error setting session:', error)
              toast.error(error.message || 'Authentication failed')
              // Redirect to login with error
              window.location.href = '/?error=' + encodeURIComponent(error.message)
              return
            }

            if (data.session) {
              console.log('Successfully authenticated user:', data.session.user?.email)
              toast.success('Authentication successful!')
              // Successfully signed in, redirect to dashboard
              // Use replaceState to avoid full page reload
              window.history.replaceState(null, '', '/dashboard')
              // Force a re-render by reloading the app
              window.dispatchEvent(new PopStateEvent('popstate'))
              return
            }
          }
        }

        // Handle email verification or magic link
        if (searchParams.has('code')) {
          const code = searchParams.get('code')
          if (code) {
            // Exchange the auth code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
              console.error('Error exchanging code for session:', error)
              toast.error(error.message || 'Authentication failed')
              // Redirect to login with error
              window.location.href = '/?error=' + encodeURIComponent(error.message)
              return
            }

            if (data.session) {
              console.log('Successfully authenticated user:', data.session.user?.email)
              toast.success('Email verified successfully!')
              // Successfully signed in, redirect to dashboard
              // Use replaceState to avoid full page reload
              window.history.replaceState(null, '', '/dashboard')
              // Force a re-render by reloading the app
              window.dispatchEvent(new PopStateEvent('popstate'))
              return
            }
          }
        }

        // Check if user is already authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error getting user:', userError)
          toast.error('Authentication verification failed')
          window.location.href = '/?error=auth_failed'
          return
        }

        if (user) {
          console.log('User already authenticated:', user.email)
          // Use replaceState to avoid full page reload
          window.history.replaceState(null, '', '/dashboard')
          // Force a re-render by reloading the app
          window.dispatchEvent(new PopStateEvent('popstate'))
          return
        }

        // If we get here, no valid session was found
        console.log('No valid session found, redirecting to login')
        toast.error('No valid authentication session found')
        window.location.href = '/?error=no_session'

      } catch (error: any) {
        console.error('Auth callback error:', error)
        toast.error('Authentication processing failed: ' + (error.message || 'Unknown error'))
        window.location.href = '/?error=' + encodeURIComponent('Authentication failed: ' + (error.message || 'Unknown error'))
      } finally {
        setIsProcessing(false)
      }
    }

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(handleAuthCallback, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isProcessing ? 'Processing authentication...' : 'Authentication complete!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isProcessing 
              ? 'Please wait while we process your authentication.' 
              : 'Redirecting to your dashboard...'
            }
          </p>
          
          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing authentication...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}