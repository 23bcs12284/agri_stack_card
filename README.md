# 🌾 AgriStack Farmer ID Card Generator — Full Stack

A production-ready full-stack application that extracts farmer registration data from government-issued AgriStack PDFs and generates print-ready Farmer ID Cards.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router v7
- Axios
- Framer Motion
- Context API

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- MySQL
- JWT Authentication (Access + Refresh Tokens)
- bcryptjs
- Multer (File Uploads)
- Helmet, CORS, Rate Limiting

## Prerequisites

- **Node.js** 18+ 
- **MySQL** 8.x (running on localhost:3306)
- **npm** 9+
- **Razorpay Sandbox Account** (for keys)

## Setup Instructions

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. Database Setup

```bash
# Create the MySQL database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS agristack;"
```

### 3. Environment Configuration

```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit with your MySQL credentials, Google OAuth credentials, and Razorpay Sandbox credentials:
# DATABASE_URL=mysql://root:Prabhakar%40147@localhost:3306/agristack
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# RAZORPAY_KEY_ID=...
# RAZORPAY_KEY_SECRET=...
# RAZORPAY_WEBHOOK_SECRET=...
```

### 4. Run database push & Seed

```bash
# Apply database schema changes non-interactively
cd backend
npx prisma db push --accept-data-loss

# Seed default admin and user accounts (marked PAID)
npm run prisma:seed
```

### 5. Start Development Servers

```bash
# From root — runs both frontend and backend concurrently
npm run dev

# Or run individually
npm run dev:frontend   # Vite dev server on :5173
npm run dev:backend    # Express API on :5001 (Port 5000 is avoided due to AirPlay conflicts)
```

### 6. Open the App

- **Frontend**: http://localhost:5173
- **API**: http://localhost:5001/api/health
- **Prisma Studio**: `cd backend && npx prisma studio`

## Default Credentials

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@agristack.in  | Admin@123  |
| User  | demo@agristack.in   | Demo@123   |

## API Endpoints

### Authentication & Payments
| Method | Endpoint                        | Auth | Description            |
|--------|---------------------------------|------|------------------------|
| POST   | `/api/auth/payment-order`       | No   | Create Razorpay order  |
| POST   | `/api/auth/register`            | No   | Register user (PAID)   |
| POST   | `/api/auth/login`               | No   | Login                  |
| POST   | `/api/auth/logout`              | Yes  | Logout                 |
| POST   | `/api/auth/refresh`             | No   | Rotate refresh tokens  |
| POST   | `/api/auth/webhook/razorpay`    | No   | Razorpay Event webhook |
| POST   | `/api/auth/forgot-password`     | No   | Password reset request |
| POST   | `/api/auth/reset-password`      | No   | Reset with token       |
| GET    | `/api/auth/verify-email/:token`  | No   | Verify email           |
| GET    | `/api/auth/google`              | No   | Google Login redirect  |
| GET    | `/api/auth/google/callback`     | No   | Google OAuth callback  |

### Farmer Cards
| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | `/api/cards`          | Yes  | Create card          |
| GET    | `/api/cards`          | Yes  | List user's cards    |
| GET    | `/api/cards/search`   | Yes  | Search cards         |
| GET    | `/api/cards/:id`      | Yes  | Get single card      |
| PUT    | `/api/cards/:id`      | Yes  | Update card          |
| DELETE | `/api/cards/:id`      | Yes  | Delete card          |

### User Profile
| Method | Endpoint                    | Auth | Description      |
|--------|-----------------------------|------|------------------|
| GET    | `/api/users/profile`        | Yes  | Get profile      |
| PUT    | `/api/users/profile`        | Yes  | Update profile   |
| PUT    | `/api/users/change-password`| Yes  | Change password  |

### Admin
| Method | Endpoint              | Auth  | Description                   |
|--------|-----------------------|-------|-------------------------------|
| GET    | `/api/admin/stats`    | Admin | Dashboard stats & transaction logs |
| GET    | `/api/admin/users`    | Admin | List all users                |
| DELETE | `/api/admin/users/:id`| Admin | Delete user                   |
| GET    | `/api/admin/cards`    | Admin | List all cards                |
| DELETE | `/api/admin/cards/:id`| Admin | Delete any card               |

## Project Structure

```
Krishi_Card/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios API layer (device fingerprinting)
│   │   ├── components/         # UI components & Footer
│   │   ├── context/            # Auth + Farmer contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Route pages (PrivacyPolicy, Register, etc.)
│   │   └── utils/              # PDF parser, image extractor, OCR
│   └── ...
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/             # Database + environment config
│   │   ├── controllers/        # Route controllers (thin)
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic (Razorpay, Sessions)
│   │   ├── utils/              # JWT, ApiError, email helpers
│   │   └── server.ts           # Entry point (rawBody capturing)
│   ├── prisma/                 # Schema + migrations + seed
│   └── uploads/                # Stored PDFs, photos, QR codes
└── package.json                # Root scripts
```

## Features

- ✅ **Paid Registration**: ₹300 One-Time Fee integrated via Razorpay. Registration fails if payment fails or is cancelled.
- ✅ **Idempotency**: Unique database order/payment constraints, row validation, and database transaction locking to prevent duplicate account creation or double payments.
- ✅ **Secure Webhooks**: Signature verification checks for Razorpay webhooks, processing payment capture and failed events safely.
- ✅ **Single Device Login**: One account logged into one device at a time. Session deactivation on new device log-in or password change.
- ✅ **Device Identification**: Custom device fingerprinter using browser, OS, and a persistent client-side UUID sent in the `x-device-id` header.
- ✅ **Google Login Integration**: Same paid registration rules apply to Google login. New OAuth profiles are redirected to pay the ₹300 fee.
- ✅ **Admin Panel Updates**: Interactive tab showing Revenue metrics, Recent Payments history logs, and Active Device Sessions details.
- ✅ **JWT Token Rotation**: Hashed refresh tokens stored in sessions table with automatic rotation on token refresh.
- ✅ **Privacy Policy**: Google OAuth Consent Screen compliant legal guidelines page at `/privacy-policy` linked across footers.
- ✅ **Aesthetics**: Emerald-themed government-style dark/light interface with Outfit font family and custom logo branding.
- ✅ PDF Parsing with text extraction + OCR fallback
- ✅ Farmer photo extraction from PDF
- ✅ QR code scanning and generation
- ✅ Land records table parsing
- ✅ Live card preview (front + back)
- ✅ PDF / PNG / Print export
- ✅ Dashboard with recent cards
- ✅ Search by name, ID, mobile, village
- ✅ Admin panel with user/card management
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Input validation and sanitization
- ✅ Rate limiting and security headers
