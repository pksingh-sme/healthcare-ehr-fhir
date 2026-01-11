/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : DashboardLayout.tsx
 * Component/Class: DashboardLayout Component
 * Description    : Main dashboard component displaying clinic analytics and key metrics
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

import { ReactNode, Suspense, lazy } from 'react'
import { LoadingSkeleton } from '../ui/loading-skeleton'

// Lazy load the sidebar for better performance
const Sidebar = lazy(() => import('./Sidebar').then(mod => ({ default: mod.Sidebar })))

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Suspense fallback={<LoadingSkeleton className="w-64 h-screen" />}>
          <Sidebar />
        </Suspense>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile sidebar button */}
        <div className="md:hidden header-colorful border-b-2 border-purple-300 dark:border-purple-600 px-4 py-3 shadow-lg">
          <button className="text-white hover:text-purple-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Page content */}
        <main className="flex-1 p-6 bg-gradient-to-br from-white via-blue-25 to-purple-25 dark:from-gray-800 dark:via-purple-900/20 dark:to-blue-900/20">
          <Suspense fallback={<LoadingSkeleton className="w-full h-64" />}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}