import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount (one-time check)
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
          toast.error('Failed to load user session')
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
        toast.error('Authentication error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()

    // Set up auth listener - KEEP SIMPLE, avoid any async operations in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        // NEVER use any async operations in callback
        setUser(session?.user || null)
        
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!')
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out!')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Auth methods with proper error handling
  async function signIn(email: string, password: string) {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      })
      
      if (error) {
        throw error
      }
      
      // Success handled by onAuthStateChange
    } catch (error: any) {
      console.error('Sign in error:', error)
      const message = error.message === 'Invalid login credentials' 
        ? 'Invalid email or password' 
        : error.message || 'Failed to sign in'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email: string, password: string) {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Check your email for verification link!')
      } else {
        toast.success('Account created successfully!')
      }
      
    } catch (error: any) {
      console.error('Sign up error:', error)
      const message = error.message || 'Failed to create account'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      // Success handled by onAuthStateChange
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(email: string) {
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.protocol}//${window.location.host}/reset-password`
        }
      )
      
      if (error) {
        throw error
      }
      
      toast.success('Password reset email sent!')
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error(error.message || 'Failed to send password reset email')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}