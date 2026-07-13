# AgriStack Full-Stack Conversion — Tasks

## Phase 1: Project Restructuring
- [x] Move existing frontend code into `frontend/` directory
- [x] Update frontend config files (vite.config.ts, tsconfig)
- [x] Create root package.json with concurrently scripts

## Phase 2: Backend
- [x] Initialize backend package.json + tsconfig
- [x] Prisma schema + seed file
- [x] Config (database, env)
- [x] Utils (ApiError, ApiResponse, jwt, email)
- [x] Middleware (auth, roleGuard, errorHandler, validate, upload)
- [x] Services (auth, card, admin, user)
- [x] Controllers (auth, card, admin, user)
- [x] Routes (auth, card, admin, user, index)
- [x] Server entry point (server.ts)
- [x] .env.example

## Phase 3: Frontend Integration
- [x] API layer (axios instance, auth.api, card.api, admin.api)
- [x] AuthContext
- [x] ProtectedRoute component
- [x] Login page
- [x] Register page
- [x] ForgotPassword page
- [x] ResetPassword page
- [x] Dashboard page
- [x] Generator page (wraps existing Home)
- [x] CardDetail page
- [x] Profile page
- [x] AdminDashboard page
- [x] Update App.tsx with routing
- [x] Update main.tsx with providers
- [x] Add axios + react-hook-form dependencies

## Phase 4: Dynamic Height, Exports & Google OAuth
- [x] Implement dynamic card height synchronization
- [x] Apply flexbox stretching and mt-auto on Annexure
- [x] Resolve PDF/PNG exports canvas tainting via crossOrigin
- [x] Remove allowTaint from html2canvas config
- [x] Dynamically calculate card printing aspect ratio in PDF exports
- [x] Configure Google OAuth credentials in backend .env
- [x] Expose Google client config on the backend
- [x] Add Google OAuth consent redirection and callback routes
- [x] Parse and register/login Google OAuth profiles on callback
- [x] Integrate URL token parameters capture in AuthContext

## Phase 5: Branding & Privacy Policy
- [x] Copy and configure the new custom logo image globally
- [x] Replace inline leaf SVG icons with new logo.png on Login, Register, Header, and Dashboard pages
- [x] Create a professional Google OAuth Consent compliant Privacy Policy page
- [x] Create reusable Footer component containing Privacy Policy links
- [x] Integrate Footer across Login, Register, Dashboard, Generator, CardDetail, and Profile pages
- [x] Add public /privacy-policy route in App.tsx

## Phase 6: Paid SaaS Business Logic
- [x] Update Prisma Schema with googleId, paymentStatus, payments table, and sessions table
- [x] Sync database schema non-interactively using prisma db push
- [x] Create SessionService with User Agent parsing and single-device login revocation
- [x] Create PaymentService with Razorpay order creation, checkout signature check, and webhooks signature verification
- [x] Update backend register, login, refresh, and logout controllers to handle device fingerprints
- [x] Redirect Google login new/unpaid registrations to payment-enabled register screen
- [x] Secure Razorpay webhook route with raw body buffer signature checks
- [x] Integrate frontend registration submit handler with Razorpay checkout popup
- [x] Implement x-device-id headers in Axios request interceptor and kickout handling on 401s
- [x] Add payment analytics, active session logs, and payment history to Admin Stats API & Dashboard UI
- [x] Update seeding script to set default users as PAID

## Phase 7: Verification
- [x] Frontend builds without errors
- [x] Backend starts without errors
- [x] README with setup instructions

## Phase 8: Payment Gateway Migration
- [x] Replace Razorpay with Cashfree APIs and SDK redirection
- [x] Sync PostgreSQL database tables with updated Cashfree schema
