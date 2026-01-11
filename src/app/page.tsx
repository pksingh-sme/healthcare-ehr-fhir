/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : page.tsx
 * Component/Class: page Page
 * Description    : Main landing page showcasing ClinicEase features and navigation
 *
 * Author         : Pramod Singh
 * Created On     : 2026-01-09
 * Last Modified  : 2026-01-09
 * Version        : 1.0.0
 *
 * Notes          : This file is part of the Clinic Management System project. 
 *                  All rights reserved by Pramod Singh.
 * ==========================================================
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 p-8 rounded-2xl bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-purple-900/30 dark:to-blue-900/30 shadow-lg border border-purple-100 dark:border-purple-800">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ClinicEase <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-xl text-blue-600 dark:text-blue-300 max-w-3xl mx-auto font-medium">
            Streamlining appointment scheduling, patient management, billing, and clinical support 
            for small to mid-size healthcare clinics across the USA
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle>Smart Scheduling</CardTitle>
              <CardDescription>
                AI-powered appointment scheduling with no-show prediction and automated overbooking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <CardTitle>Intelligent Billing</CardTitle>
              <CardDescription>
                Automated ICD-10/CPT coding with beautiful visual progress tracking and Stripe integration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <CardTitle>Patient Portal</CardTitle>
              <CardDescription>
                Comprehensive patient management with secure messaging, records, and payment processing
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started Today</CardTitle>
              <CardDescription>
                Choose your role to access the ClinicEase AI platform
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login?role=staff">
                <Button size="lg" className="w-full sm:w-auto clinic-gradient text-white">
                  Staff Login
                </Button>
              </Link>
              <Link href="/login?role=patient">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Patient Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 ClinicEase AI. HIPAA-compliant healthcare management system.</p>
        </footer>
      </div>
    </main>
  )
}