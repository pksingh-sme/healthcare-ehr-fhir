/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: me API Route
 * Description    : Authentication API endpoints for user login, registration, and session management
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

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeaders, verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeaders(request.headers)
    
    if (!token) {
      return errorResponse('No token provided', 401)
    }

    const payload = verifyToken(token)
    if (!payload) {
      return errorResponse('Invalid token', 401)
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { token },
    })

    if (!session || session.expiresAt < new Date()) {
      return errorResponse('Session expired', 401)
    }

    // Get user with relations
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        patient: true,
        provider: true,
      },
    })

    if (!user || !user.isActive) {
      return errorResponse('User not found or inactive', 404)
    }

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      twoFAEnabled: user.twoFAEnabled,
      patient: user.patient,
      provider: user.provider,
    }

    return successResponse(userData)
  } catch (error) {
    return handleApiError(error)
  }
}