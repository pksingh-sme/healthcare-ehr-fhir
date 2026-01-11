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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileImageUpload } from '@/components/ui/profile-image-upload'
import { useAuth } from '@/contexts/AuthContext'

export default function DemoProfilePage() {
  const { user, refreshUser } = useAuth()

  const handleImageUpload = async (imageUrl: string) => {
    console.log('Image uploaded:', imageUrl)
    // Refresh user data to update the UI with the new profile image
    if (refreshUser) {
      await refreshUser()
    }
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
        <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-purple-900/30 dark:to-blue-900/30 shadow-lg border border-purple-100 dark:border-purple-800 rounded-xl p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Profile Image Upload Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Test the profile image upload functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600 dark:text-purple-400">
                Upload Profile Picture
              </CardTitle>
              <CardDescription>
                Upload or change your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ProfileImageUpload 
                currentImageUrl={user.profileImage}
                onImageUpload={handleImageUpload}
              />
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">
                Current User Info
              </CardTitle>
              <CardDescription>
                Your current profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name:</label>
                <p>{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email:</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role:</label>
                <p>{user.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Profile Image:</label>
                <p className="text-xs text-gray-500">
                  {user.profileImage ? user.profileImage : 'No image uploaded'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}