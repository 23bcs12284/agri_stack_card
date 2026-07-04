"use client";

import React from 'react';
import Link from 'next/link';
import { HiArrowLeft, HiShieldCheck, HiLockClosed, HiEnvelope } from 'react-icons/hi2';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* ── STICKY HEADER ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="AgriStack Card Logo"
              className="h-10 w-10 rounded-xl object-contain bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-700"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                Agri Stack Card
              </h1>
              <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                Farmer ID Card Generator
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-bold text-white shadow-md transition-all active:scale-97 cursor-pointer"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-green-800 to-emerald-950 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
            <HiShieldCheck className="h-10 w-10 text-green-300" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Privacy Policy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-green-100 sm:text-base leading-relaxed">
            Effective Date: July 3, 2026
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-green-200/90 sm:text-sm">
            At Agri Stack Card, we value your privacy and are committed to protecting your personal information. This Privacy Policy details how we collect, use, and protect your information when using our services.
          </p>
        </div>
      </div>

      {/* ── CONTENT SECTION ──────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Table of Contents
              </h3>
              <nav className="flex flex-col gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <a href="#introduction" className="hover:text-green-600 dark:hover:text-green-400">1. Introduction</a>
                <a href="#collection" className="hover:text-green-600 dark:hover:text-green-400">2. Information We Collect</a>
                <a href="#usage" className="hover:text-green-600 dark:hover:text-green-400">3. How We Use Information</a>
                <a href="#google-signin" className="hover:text-green-600 dark:hover:text-green-400">4. Google Sign-In & OAuth</a>
                <a href="#storage" className="hover:text-green-600 dark:hover:text-green-400">5. Data Storage</a>
                <a href="#sharing" className="hover:text-green-600 dark:hover:text-green-400">6. Data Sharing</a>
                <a href="#cookies" className="hover:text-green-600 dark:hover:text-green-400">7. Cookies Policy</a>
                <a href="#rights" className="hover:text-green-600 dark:hover:text-green-400">8. Your User Rights</a>
                <a href="#security" className="hover:text-green-600 dark:hover:text-green-400">9. Security Measures</a>
                <a href="#third-party" className="hover:text-green-600 dark:hover:text-green-400">10. Third-Party Services</a>
                <a href="#children" className="hover:text-green-600 dark:hover:text-green-400">11. Children's Privacy</a>
                <a href="#changes" className="hover:text-green-600 dark:hover:text-green-400">12. Policy Changes</a>
                <a href="#contact" className="hover:text-green-600 dark:hover:text-green-400">13. Contact Info</a>
              </nav>
            </div>
          </aside>

          {/* Main Legal Copy */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Card wrapper */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors sm:p-8 space-y-8">
              
              {/* 1. Introduction */}
              <section id="introduction" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  1. Introduction
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  Welcome to <strong>Agri Stack Card</strong>. We provide tools for farmers and agricultural administrators to easily parse official documents, extract farmer profiles and land holding summaries, and generate high-quality, print-ready digital identity cards. 
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  This Privacy Policy describes how we collect, store, utilize, and protect your information when you interact with our application. By signing into Agri Stack Card and uploading credentials, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              {/* 2. Information We Collect */}
              <section id="collection" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  2. Information We Collect
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  To provide a seamless card generation experience, we collect specific information, including:
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li><strong>Account Credentials</strong>: We access your basic profile information such as your <strong>Name</strong> and <strong>Email Address</strong> when you authenticate using Google Sign-In.</li>
                  <li><strong>Profile Imagery</strong>: We may optionally display your Google Account <strong>Profile Picture</strong> for dashboard personalization.</li>
                  <li><strong>Uploaded PDF Documents</strong>: The raw PDFs containing your official land holding registry documents which are processed to extract relevant text and data points.</li>
                  <li><strong>Generated Card Information</strong>: Compiled records containing names, IDs, dates of birth, land records tables, photographs, and generated QR codes.</li>
                  <li><strong>Technical Usage Metadata</strong>: Log files automatically generated by servers, including your IP address, browser type, device details, and operating system, to ensure stability and monitor system security.</li>
                </ul>
              </section>

              {/* 3. How We Use Your Information */}
              <section id="usage" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  3. How We Use Your Information
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  All collected details are utilized strictly to support the system's operational integrity, specifically to:
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li>Securely authenticate users using standard Google OAuth protocols.</li>
                  <li>Extract structure from uploaded PDFs, run OCR pipelines, and construct physical card previews.</li>
                  <li>Save generated cards and details within your personal dashboard, allowing you to access, update, print, or download them at any time.</li>
                  <li>Identify and address system errors, improve server response times, and optimize layout renders.</li>
                  <li>Provide active customer support and investigate user concerns.</li>
                  <li>Maintain strict security measures against malicious attacks, spam, or unauthorized access.</li>
                </ul>
              </section>

              {/* 4. Google Sign-In & OAuth Compliance */}
              <section id="google-signin" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  4. Google Sign-In & OAuth Compliance
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  Agri Stack Card integrates Google Sign-In (OAuth 2.0) for secure authentication. 
                </p>
                <div className="rounded-xl bg-green-50 border border-green-200/60 p-4 dark:bg-green-950/20 dark:border-green-900/40 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 mb-2 font-bold text-green-800 dark:text-green-400">
                    <HiLockClosed className="h-4.5 w-4.5" />
                    Google API Services User Data Policy Compliance
                  </div>
                  <p className="leading-relaxed text-justify text-xs sm:text-sm">
                    Our application's use and transfer of information received from Google APIs will strictly adhere to the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements. We request only the minimum required access permissions (`openid`, `profile`, `email`) and never capture, view, or store your Google account passwords.
                  </p>
                </div>
              </section>

              {/* 5. Data Storage */}
              <section id="storage" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  5. Data Storage & Retention
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  Your profile and card generation outputs are stored on secure MySQL databases hosted with industry-standard hosting partners.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  Uploaded PDF documents are stored only to parse information and are handled locally. Raw files are saved securely under your account and are never exposed publicly. Security patches, access audits, and encryption layers protect all stored records.
                </p>
              </section>

              {/* 6. Data Sharing */}
              <section id="sharing" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  6. Data Sharing & Third-Party Disclosure
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  We maintain a strict stance against commercializing user information.
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li><strong>No Selling</strong>: We never sell, trade, rent, or monetize your personal details or documents with any third-party marketing companies or advertisers.</li>
                  <li><strong>Zero Ad Targeting</strong>: Your uploaded PDFs, crop locations, and identification entries are never shared with advertising platforms.</li>
                  <li><strong>Essential Sharing Only</strong>: Data is shared only with trusted hosting and database providers required to keep the application active, or when legally compelled by law enforcement officials under standard judicial warrants.</li>
                </ul>
              </section>

              {/* 7. Cookies Policy */}
              <section id="cookies" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  7. Cookies Policy
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  We utilize cookies and local web storage mechanisms to provide essential services:
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li><strong>Authentication Cookies</strong>: Safe `httpOnly` session cookies that recognize your session and prevent you from having to sign in repeatedly.</li>
                  <li><strong>Preferences Storage</strong>: Storing choices like dark mode preferences in local storage.</li>
                  <li><strong>Analytics</strong>: Standard, anonymized performance cookies to track page loads and optimize navigation design.</li>
                </ul>
              </section>

              {/* 8. Your User Rights */}
              <section id="rights" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  8. Your User Rights
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  We empower users with full control over their account data. You have the right to:
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li>Review all profile data and card listings generated under your profile.</li>
                  <li>Edit misread names, IDs, dates of birth, or land record values.</li>
                  <li>Delete generated card listings, which permanently purges the card, the parsed details, and associated documents from our databases.</li>
                  <li>Request complete account deletion, which completely cleanses all your user information, database tables, and attachments from our systems.</li>
                </ul>
              </section>

              {/* 9. Security Measures */}
              <section id="security" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  9. Security Measures
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  Agri Bold Card employs robust industry standards to shield details from theft or exploitation:
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li>HTTPS transport layer encryption for all API calls and frontend exchanges.</li>
                  <li>Secured hashing (`bcryptjs`) for user credentials.</li>
                  <li>Proper cookie authorization guards and JSON Web Token validations.</li>
                  <li>Strict SQL query parameterization via Prisma ORM to block injection attacks.</li>
                </ul>
              </section>

              {/* 10. Third-Party Services */}
              <section id="third-party" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  10. Third-Party Services
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  Our service connects to external modules to run the stack. These include:
                </p>
                <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li><strong>Google Identity Service</strong>: Handles OAuth verification.</li>
                  <li><strong>Cloud Infrastructure</strong>: Hosts the Node.js API endpoints and handles server logs.</li>
                  <li><strong>Database Server</strong>: Stores farmer cards and profiles.</li>
                </ul>
              </section>

              {/* 11. Children's Privacy */}
              <section id="children" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  11. Children's Privacy
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  Our services are targeted strictly towards adult farmers, farm owners, and administrative staff who manage land hold registries. We do not knowingly collect, request, or parse information from anyone under the age of 13. If we discover a minor has registered an account, we will purge all such data immediately.
                </p>
              </section>

              {/* 12. Policy Changes */}
              <section id="changes" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  12. Changes to this Privacy Policy
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  We may adjust this policy dynamically to reflect database migrations, regulatory updates, or changes in Google OAuth terms. When significant alterations take place, we will notify registered users via email alerts or display a dashboard prompt.
                </p>
              </section>

              {/* 13. Contact Info */}
              <section id="contact" className="scroll-mt-24 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  13. Contact Information
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  For suggestions, question requests, or account data deletion requests, contact our privacy compliance desk:
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                    <HiEnvelope className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-455 uppercase">Support Email</div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">support@agristack.in</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                    <HiShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-455 uppercase">Compliance Desk</div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Agri Stack Card Inc.</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

          </div>
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 transition-colors no-print">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 sm:px-6 lg:px-8">
          <p>© 2026 Agri Stack Card. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}
