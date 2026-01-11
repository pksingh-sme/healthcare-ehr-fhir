/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: profile API Route
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

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Only providers can update their profile' }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, specialty } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
      include: {
        provider: true
      }
    })

    // Update provider-specific information
    if (updatedUser.provider) {
      await prisma.provider.update({
        where: { id: updatedUser.provider.id },
        data: {
          specialty: specialty || null,
        }
      })
    }

    // Return updated user data
    const refreshedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        provider: true,
        patient: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: refreshedUser
    })

  } catch (error) {
    console.error('Error updating provider profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}