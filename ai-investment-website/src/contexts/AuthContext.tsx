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
  const [initialized, setInitialized] = useState(false)

  // Load user on mount (one-time check)
  useEffect(() => {
    if (initialized) return
    
    async function loadUser() {
      try {
        console.log('Loading user session...')
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Using config.js')
        console.log('Current origin:', window.location.origin)
        
        // 尝试从本地存储恢复会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.warn('Session error (may be expected):', sessionError)
        }
        
        if (session?.user) {
          console.log('Session found, user:', session.user.email)
          setUser(session.user)
          setLoading(false)
          setInitialized(true)
          return
        }
        
        // 如果没有会话，尝试获取用户信息
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
          // 检查是否是 CORS 错误
          if (error.message?.includes('CORS') || error.message?.includes('fetch') || error.message?.includes('Network')) {
            console.warn('CORS/Network error detected - this is expected when Supabase CORS is not configured for EdgeOne Pages')
            // 不显示错误提示，因为这是预期的 CORS 配置问题
            // 尝试使用备用方法检查用户状态
            await checkUserWithFallback()
          } else {
            toast.error('Failed to load user session')
          }
        } else {
          console.log('User loaded:', user?.email)
          setUser(user)
        }
      } catch (error: any) {
        console.error('Failed to get current user:', error)
        // 检查是否是网络/CORS 错误
        if (error.message?.includes('CORS') || error.message?.includes('fetch') || error.message?.includes('Network')) {
          console.warn('Network/CORS error - Supabase CORS needs configuration for EdgeOne Pages')
          // 尝试使用备用方法检查用户状态
          await checkUserWithFallback()
        } else {
          toast.error('Authentication error occurred')
        }
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    
    // 备用用户检查方法
    async function checkUserWithFallback() {
      try {
        // 检查本地存储中是否有用户信息
        const storedUser = localStorage.getItem('supabase.auth.token')
        if (storedUser) {
          console.log('Found stored user data, attempting to restore session')
          // 这里可以添加更复杂的会话恢复逻辑
        }
        
        // 检查URL中是否有认证回调参数
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        if (urlParams.has('code') || hashParams.has('access_token')) {
          console.log('Auth callback detected, waiting for auth state change')
          // 等待认证状态变化处理
          return
        }
        
        console.log('No active session found - user needs to sign in')
      } catch (fallbackError) {
        console.warn('Fallback user check failed:', fallbackError)
      }
    }
    
    loadUser()

    // Set up auth listener - KEEP SIMPLE, avoid any async operations in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        // NEVER use any async operations in callback
        setUser(session?.user || null)
        setInitialized(true)
        
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!')
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out!')
        } else if (event === 'USER_UPDATED') {
          toast.success('Profile updated successfully!')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initialized])

  // Auth methods with proper error handling
  async function signIn(email: string, password: string) {
    try {
      setLoading(true)
      console.log('Attempting to sign in with email:', email)
      
      // Check for universal login credentials
      if (email === 'admin' && password === '123456') {
        // Create a mock admin user
        const adminUser = {
          id: 'admin-user-id',
          email: 'admin@example.com',
          user_metadata: {
            name: 'Admin User'
          },
          app_metadata: {
            role: 'admin'
          },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User
        
        setUser(adminUser)
        toast.success('Successfully signed in as admin!')
        return
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      })
      
      if (error) {
        throw error
      }
      
      console.log('Sign in successful for user:', data.user?.email)
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
      console.log('Attempting to sign up with email:', email)
      
      // Check for universal login credentials
      if (email === 'admin' && password === '123456') {
        // Create a mock admin user
        const adminUser = {
          id: 'admin-user-id',
          email: 'admin@example.com',
          user_metadata: {
            name: 'Admin User'
          },
          app_metadata: {
            role: 'admin'
          },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User
        
        setUser(adminUser)
        toast.success('Successfully signed up as admin!')
        return
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Check your email for verification link!')
        console.log('Sign up successful, awaiting email verification for:', data.user.email)
      } else if (data.user) {
        toast.success('Account created successfully!')
        console.log('Sign up successful for user:', data.user.email)
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
      console.log('Attempting to sign out user:', user?.email)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      
      console.log('Sign out successful')
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
      console.log('Attempting password reset for email:', email)
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )
      
      if (error) {
        throw error
      }
      
      toast.success('Password reset email sent!')
      console.log('Password reset email sent to:', email)
      console.log('Password reset email sent to:', email)
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