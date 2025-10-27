import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthForm } from '@/components/AuthForm'
import { AuthCallback } from '@/components/AuthCallback'
import { Dashboard } from '@/components/Dashboard'
import { Loader2 } from 'lucide-react'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Route detection based on URL
function getRoute(): 'auth' | 'callback' | 'dashboard' | 'error' {
  const path = window.location.pathname
  const hash = window.location.hash
  const searchParams = new URLSearchParams(window.location.search)
  
  // Auth callback route
  if (path === '/auth/callback' || hash.includes('access_token') || hash.includes('refresh_token') || searchParams.has('code')) {
    return 'callback'
  }
  
  // Dashboard route (when authenticated)
  if (path === '/dashboard' || path === '/' || path === '') {
    return 'dashboard'
  }
  
  // Error route
  if (searchParams.has('error')) {
    return 'error'
  }
  
  // Default to auth
  return 'auth'
}

function AppContent() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [route, setRoute] = useState(getRoute())
  
  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRoute())
    }
    
    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('hashchange', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('hashchange', handleRouteChange)
    }
  }, [])
  
  // Show loading spinner during authentication check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Handle auth callback route
  if (route === 'callback') {
    return <AuthCallback />
  }

  // Show dashboard if user is authenticated
  if (user) {
    // 如果用户已认证，总是显示仪表板，无论当前路由是什么
    return <Dashboard />
  }

  // Show auth form if user is not authenticated
  return (
    <AuthForm 
      mode={authMode} 
      onSwitchMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
    />
  )
}

function App() {
  const [showApp, setShowApp] = useState(false)
  
  useEffect(() => {
    // Check if we're running in a browser environment
    if (typeof window !== 'undefined') {
      setShowApp(true)
    }
  }, [])

  if (!showApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="App">
            <AppContent />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App