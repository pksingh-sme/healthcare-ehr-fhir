/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : auth.ts
 * Component/Class: auth Utility
 * Description    : Authentication utilities and JWT token management functions
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

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: Role
  firstName: string
  lastName: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  twoFAEnabled: boolean
  patient?: {
    id: string
    userId: string
    dateOfBirth?: Date
    emergencyContact?: string
    insuranceProvider?: string
  }
  provider?: {
    id: string
    userId: string
    licenseNumber?: string
    specialty?: string
    department?: string
  }
}

export async function verifyTokenFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = extractTokenFromHeaders(request.headers)
    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
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
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || undefined,
      twoFAEnabled: user.twoFAEnabled,
      patient: user.patient ? {
        id: user.patient.id,
        userId: user.patient.userId,
        dateOfBirth: user.patient.dateOfBirth || undefined,
        emergencyContact: user.patient.emergencyContact || undefined,
        insuranceProvider: user.patient.insuranceProvider || undefined,
      } : undefined,
      provider: user.provider ? {
        id: user.provider.id,
        userId: user.provider.userId,
        licenseNumber: user.provider.licenseNumber || undefined,
        specialty: user.provider.specialty || undefined,
        department: user.provider.department || undefined,
      } : undefined,
    }
  } catch (error) {
    console.error('Error verifying token from request:', error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeaders(headers: Headers): string | null {
  const authorization = headers.get('authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }
  return authorization.substring(7)
}

export function hasPermission(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole)
}

// Role hierarchy for access control
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.ADMIN]: [Role.ADMIN, Role.PROVIDER, Role.PATIENT],
  [Role.PROVIDER]: [Role.PROVIDER, Role.PATIENT],
  [Role.PATIENT]: [Role.PATIENT],
}

export function canAccessRole(userRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[userRole].includes(targetRole)
}

// 2FA utilities
export function generateTwoFASecret(): string {
  // In a real app, use speakeasy or similar library
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function verifyTwoFAToken(secret: string, token: string): boolean {
  // Simplified 2FA verification - in production, use proper TOTP library
  // For demo purposes, accept any 6-digit number
  return /^\\d{6}$/.test(token)
}