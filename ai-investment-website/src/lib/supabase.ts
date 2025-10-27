import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment or global config
// 支持开发环境和生产环境配置
const getSupabaseConfig = () => {
  // 优先使用环境变量（开发环境）
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  }
  
  // 生产环境使用全局配置
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return {
      url: window.APP_CONFIG.supabaseUrl,
      key: window.APP_CONFIG.supabaseAnonKey
    }
  }
  
  // 回退到环境变量或抛出错误
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('Missing Supabase configuration')
    throw new Error('Missing Supabase URL and anonymous key configuration.')
  }
  
  return { url, key }
}

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig()

// Create Supabase client instance with enhanced CORS handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // 使用 PKCE 流程，更适合生产环境
    storage: {
      // 使用更安全的存储方式
      getItem: (key) => {
        try {
          return localStorage.getItem(key)
        } catch (error) {
          console.warn('Failed to get item from storage:', error)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.warn('Failed to set item in storage:', error)
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn('Failed to remove item from storage:', error)
        }
      }
    }
  },
  global: {
    // 添加 CORS 和代理支持
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
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