import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qsknfmycjwnkvgnwoqpq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza25mbXljandua3ZnbndvcXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDIzNzYsImV4cCI6MjA3MDIxODM3Nn0.60mKLGrETHGhlck6f7UM4shkl750DueRMuDN9Bc2Ui8'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Type definitions for API responses
export interface APIResponse<T = any> {
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Helper function to safely invoke edge functions with proper error handling
export async function invokeEdgeFunction<T = any>(
  functionName: string, 
  body: any = {}
): Promise<APIResponse<T>> {
  try {
    console.log(`Invoking edge function: ${functionName}`, body)
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body
    })

    if (error) {
      console.error(`Edge function ${functionName} error:`, error)
      return {
        error: {
          code: 'EDGE_FUNCTION_ERROR',
          message: error.message || 'Unknown edge function error',
          details: error
        }
      }
    }

    // Handle both wrapped and direct responses
    if (data?.data) {
      return { data: data.data }
    } else if (data?.error) {
      return {
        error: {
          code: data.error.code || 'API_ERROR',
          message: data.error.message || 'Unknown API error',
          details: data.error.details
        }
      }
    } else {
      return { data }
    }
  } catch (err: any) {
    console.error(`Failed to invoke edge function ${functionName}:`, err)
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Network error occurred',
        details: err
      }
    }
  }
}

// Helper to get current user safely
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}