/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : settings-dropdown.tsx
 * Component/Class: settings-dropdown Component
 * Description    : UI component for settings-dropdown
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
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfileImageUpload } from '@/components/ui/profile-image-upload'

interface SettingsDropdownProps {
  className?: string
}

export function SettingsDropdown({ className }: SettingsDropdownProps) {
  const { user, logout, token, refreshUser } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialty: user?.provider?.specialty || '',
  })

  const handleLogout = () => {
    logout()
  }

  const handleProfileSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      
      // Refresh user data in auth context
      if (refreshUser) {
        await refreshUser()
      }
      
      setProfileOpen(false)
      // You can add a toast notification here for success
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-all duration-300 rounded-md ${className}`}
          >
            <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 shadow-xl">
          <DropdownMenuLabel className="text-purple-700 dark:text-purple-300 font-semibold text-xs">
            ⚙️ Settings
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-purple-200 dark:bg-purple-700" />
          
          <DialogTrigger asChild>
            <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/50 cursor-pointer">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </DropdownMenuItem>
          </DialogTrigger>
          
          <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/50 p-0">
            <div className="flex items-center w-full px-2 py-1.5">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              <span className="mr-2">Theme</span>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-purple-200 dark:bg-purple-700" />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="hover:bg-red-50 dark:hover:bg-red-900/50 cursor-pointer text-red-600 dark:text-red-400"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Edit Dialog */}
      <DialogContent className="max-w-md bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700">
        <DialogHeader>
          <DialogTitle className="text-purple-700 dark:text-purple-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}
          
          {/* Profile Image Upload */}
          <div className="flex justify-center py-4 border-b border-purple-100 dark:border-purple-800">
            <ProfileImageUpload
              currentImageUrl={user?.profileImage}
              onImageUpload={(imageUrl) => {
                // Refresh user data after image upload
                if (refreshUser) {
                  refreshUser()
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-purple-700 dark:text-purple-300">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-purple-700 dark:text-purple-300">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email" className="text-purple-700 dark:text-purple-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-purple-700 dark:text-purple-300">Phone</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
            />
          </div>
          
          {user?.role === 'PROVIDER' && (
            <div>
              <Label htmlFor="specialty" className="text-purple-700 dark:text-purple-300">Specialty</Label>
              <Input
                id="specialty"
                value={profileData.specialty}
                onChange={(e) => setProfileData(prev => ({ ...prev, specialty: e.target.value }))}
                placeholder="e.g., Cardiology, Internal Medicine"
                className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setProfileOpen(false)
              setError(null)
            }}
            disabled={saving}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProfileSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}