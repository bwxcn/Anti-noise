// Global type declarations for the application

interface Window {
  APP_CONFIG?: {
    supabaseUrl: string
    supabaseAnonKey: string
    environment: string
    baseUrl: string
    apiEndpoints: {
      auth: string
      rest: string
      storage: string
    }
  }
}