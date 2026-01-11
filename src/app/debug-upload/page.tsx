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

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugUploadPage() {
  const { user, token, refreshUser } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLogs([])
    addLog('🔍 Starting upload debug process...')
    addLog(`📁 File selected: ${file.name}`)
    addLog(`📏 File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
    addLog(`🎭 File type: ${file.type}`)
    addLog(`👤 User authenticated: ${!!user}`)
    addLog(`🔑 Token available: ${!!token}`)
    addLog(`🏥 User role: ${user?.role}`)
    addLog(`🖼️ Current profile image: ${user?.profileImage || 'None'}`)

    try {
      setUploading(true)
      addLog('🚀 Creating FormData...')
      
      const formData = new FormData()
      formData.append('profileImage', file)
      
      addLog('📡 Sending upload request...')
      
      const response = await fetch('/api/profile/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      addLog(`📊 Response status: ${response.status}`)
      addLog(`📋 Response status text: ${response.statusText}`)

      const data = await response.json()
      addLog(`📦 Response data: ${JSON.stringify(data, null, 2)}`)

      if (!response.ok) {
        addLog(`❌ Upload failed: ${data.error || 'Unknown error'}`)
        return
      }

      addLog(`✅ Upload successful!`)
      addLog(`🖼️ New image URL: ${data.imageUrl}`)
      
      addLog('🔄 Refreshing user data...')
      if (refreshUser) {
        await refreshUser()
        addLog('✅ User data refreshed')
      } else {
        addLog('❌ RefreshUser function not available')
      }

    } catch (error) {
      addLog(`💥 Error occurred: ${error instanceof Error ? error.message : String(error)}`)
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      addLog('🏁 Upload process completed')
    }
  }

  const testApiEndpoint = async () => {
    setLogs([])
    addLog('🧪 Testing API endpoint availability...')
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      addLog(`📊 /api/auth/me status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addLog(`✅ User data from API: ${JSON.stringify(data.data, null, 2)}`)
      } else {
        addLog(`❌ API error: ${response.statusText}`)
      }
    } catch (error) {
      addLog(`💥 API test error: ${error instanceof Error ? error.message : String(error)}`)
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
            Upload Debug Center
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Debug and troubleshoot profile image upload issues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600 dark:text-purple-400">
                Upload Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select an image to upload:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              
              <Button
                onClick={testApiEndpoint}
                variant="outline"
                className="w-full"
              >
                Test API Endpoint
              </Button>
              
              {uploading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">
                Debug Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No logs yet. Upload a file to see debug information.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {logs.length > 0 && (
                <Button
                  onClick={() => setLogs([])}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Clear Logs
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              Current User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name:</label>
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
                <label className="text-sm font-medium text-gray-600">Profile Image:</label>
                <p className="text-sm break-all">
                  {user.profileImage || 'No image set'}
                </p>
              </div>
            </div>
            
            {user.profileImage && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Current Image Preview:</label>
                <div className="mt-2">
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="w-20 h-20 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center text-red-600 text-xs">Image not found</div>'
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}