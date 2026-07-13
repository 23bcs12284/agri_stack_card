interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  UPLOAD_DIR: string;
  NODE_ENV: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  CASHFREE_APP_ID: string;
  CASHFREE_SECRET_KEY: string;
  CASHFREE_MODE: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres.gehykpmbhajlkvdzovot:rFwLYLEeq2uCKlgB@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '969774300299-s5o5lq1vtkgebu3i29ma87757v7gec84.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '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',
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || '1335443b231730648f579c5b1a73445331',
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_prod_3a6b6f6b1c4f2d9b126974da95ae3c97_ec5c7cfa',
  CASHFREE_MODE: process.env.CASHFREE_MODE || 'production',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5001',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://gehykpmbhajlkvdzovot.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'sb_publishable_kUXjmszjTq6OHDIOF65c3w_wJYhNxO_',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_aOT1cmOzYrz9_-gaBG54YA_4vzJhlLh',
};

export default env;
export type { EnvConfig };
