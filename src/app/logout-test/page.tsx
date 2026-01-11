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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function LogoutTestPage() {
  const { user, logout, token } = useAuth()

  const handleLogout = () => {
    console.log('Logout button clicked')
    console.log('Current user:', user)
    console.log('Current token:', token ? 'Token exists' : 'No token')
    logout()
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Please log in to view this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="bg-gradient-to-r from-white via-red-50 to-orange-50 dark:from-gray-800 dark:via-red-900/30 dark:to-orange-900/30 shadow-lg border border-red-100 dark:border-red-800 rounded-xl p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
            Logout Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Test the logout functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Current Session Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">User:</label>
              <p className="font-semibold">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email:</label>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role:</label>
              <p className="font-semibold">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Token Status:</label>
              <p className="font-semibold text-green-600">{token ? '✅ Active' : '❌ No Token'}</p>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 w-full"
              >
                🔓 Test Logout Function
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This will log you out and redirect to the login page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}