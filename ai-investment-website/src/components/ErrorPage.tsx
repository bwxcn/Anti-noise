import React, { useEffect } from 'react'
import { AlertCircle, Home, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ErrorPageProps {
  title?: string
  message?: string
  error?: string
}

export function ErrorPage({ 
  title = 'Authentication Error', 
  message = 'An error occurred during the authentication process.',
  error 
}: ErrorPageProps) {
  const navigate = useNavigate()
  
  // Get error from URL parameters if not provided as props
  useEffect(() => {
    if (!error) {
      const urlParams = new URLSearchParams(window.location.search)
      const errorParam = urlParams.get('error')
      if (errorParam) {
        // This would normally update state, but for simplicity we'll just log it
        console.log('Error from URL:', errorParam)
      }
    }
  }, [error])

  const handleGoHome = () => {
    // Clear any error parameters and go to home
    window.location.href = '/'
  }

  const handleRetry = () => {
    // Clear any error parameters and go to home
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-red-800 mb-2">Error details:</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </button>
            
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>If this problem persists, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  )
}