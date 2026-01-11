/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: image API Route
 * Description    : User profile management and personal information API endpoints
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    console.log('Profile image upload request received')
    
    const user = await verifyTokenFromRequest(request)
    console.log('User verification result:', user ? { id: user.id, email: user.email, role: user.role } : 'No user found')
    
    if (!user) {
      console.log('Authentication failed - no valid user token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('profileImage') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
    } catch (dirError) {
      console.error('Error creating uploads directory:', dirError)
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `profile_${user.id}_${timestamp}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Generate public URL
    const imageUrl = `/uploads/profiles/${filename}`

    // Update user's profile image in database
    console.log('Attempting to update user profile image in database...')
    console.log('User ID:', user.id)
    console.log('Image URL:', imageUrl)
    
    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: imageUrl }
      })
      
      console.log('Database update successful. Updated user:', {
        id: updatedUser.id,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage
      })
      
    } catch (dbError) {
      console.error('Database update failed:', dbError)
      return NextResponse.json({ 
        error: 'Failed to update profile image in database',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl
    })

  } catch (error) {
    console.error('Error uploading profile image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove profile image from database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: null }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile image removed successfully'
    })

  } catch (error) {
    console.error('Error removing profile image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}