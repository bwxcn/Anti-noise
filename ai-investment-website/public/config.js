// Production configuration for EdgeOne Pages deployment
window.APP_CONFIG = {
  supabaseUrl: 'https://qsknfmycjwnkvgnwoqpq.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza25mbXljandua3ZnbndvcXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDIzNzYsImV4cCI6MjA3MDIxODM3Nn0.60mKLGrETHGhlck6f7UM4shkl750DueRMuDN9Bc2Ui8',
  environment: 'production',
  baseUrl: './',
  apiEndpoints: {
    auth: 'https://qsknfmycjwnkvgnwoqpq.supabase.co/auth/v1',
    rest: 'https://qsknfmycjwnkvgnwoqpq.supabase.co/rest/v1',
    storage: 'https://qsknfmycjwnkvgnwoqpq.supabase.co/storage/v1'
  },
  corsConfig: {
    // 仅支持 EdgeOne Pages 域名
    allowedOrigins: [
      'https://*.edgeone.run',
      'https://ai-investment-*.edgeone.run'
    ]
  }
};