/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : profile-image-upload.tsx
 * Component/Class: profile-image-upload Component
 * Description    : UI component for profile-image-upload
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

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileImageUploadProps {
  currentImageUrl?: string
  onImageUpload?: (imageUrl: string) => void
  className?: string
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  onImageUpload, 
  className 
}: ProfileImageUploadProps) {
  const { user, token, refreshUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError(null)
    
    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type)
      console.log('Auth token available:', !!token)
      console.log('User available:', !!user)

      if (!token) {
        throw new Error('No authentication token available')
      }

      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await fetch('/api/profile/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('Upload response status:', response.status)
      
      const data = await response.json()
      console.log('Upload response data:', data)

      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status ${response.status}`)
      }

      if (onImageUpload) {
        onImageUpload(data.imageUrl)
      }

      setPreviewUrl(data.imageUrl)
      
      // Refresh user data to get updated profile image
      if (refreshUser) {
        console.log('Triggering user refresh...')
        await refreshUser()
      }
      
    } catch (error) {
      console.error('Error uploading image:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload image')
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
  }

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className="relative group">
        <Avatar className="w-20 h-20 cursor-pointer border-2 border-purple-200 dark:border-purple-700">
          <AvatarImage 
            src={previewUrl || currentImageUrl} 
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay for upload indication */}
        <div 
          onClick={handleClick}
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        {/* Loading indicator */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={uploading}
          className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          {uploading ? 'Uploading...' : 'Change Photo'}
        </Button>
        
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          Max 5MB • JPG, PNG, GIF
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}