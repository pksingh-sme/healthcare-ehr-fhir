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

'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MessagingCenter } from '@/components/realtime/MessagingCenter'
import { ConnectionStatus } from '@/components/realtime/NotificationCenter'

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="p-6 rounded-xl bg-gradient-to-r from-white via-pink-50 to-rose-50 dark:from-gray-800 dark:via-pink-900/30 dark:to-rose-900/30 shadow-lg border border-pink-100 dark:border-pink-800">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent flex items-center">
            <svg className="w-10 h-10 mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
          </h1>
          <p className="text-pink-600 dark:text-pink-300 mt-2 font-medium text-lg">
            Secure real-time communication between patients and healthcare providers
          </p>
        </div>

        <div className="bg-gradient-to-br from-white via-pink-25 to-rose-25 dark:from-gray-800 dark:via-pink-900/10 dark:to-rose-900/10 rounded-xl p-6 border-2 border-pink-200 dark:border-pink-700 shadow-lg">
          <MessagingCenter />
        </div>
        
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-rose-200 dark:border-rose-700">
          <ConnectionStatus />
        </div>
      </div>
    </DashboardLayout>
  )
}