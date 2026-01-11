/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: logout API Route
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
import { extractTokenFromHeaders } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeaders(request.headers)
    
    if (!token) {
      return errorResponse('No token provided', 401)
    }

    // Delete the session
    await prisma.session.deleteMany({
      where: { token },
    })

    return successResponse(null, 'Logout successful')
  } catch (error) {
    return handleApiError(error)
  }
}