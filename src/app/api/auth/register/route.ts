/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: register API Route
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
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'
import { Role } from '@prisma/client'

const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['PATIENT', 'PROVIDER', 'ADMIN']),
  // Patient specific fields
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  // Provider specific fields
  title: z.string().optional(),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  department: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = RegisterSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return errorResponse('User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role as Role,
        },
      })

      // Create patient or provider profile based on role
      if (data.role === 'PATIENT') {
        await tx.patient.create({
          data: {
            userId: user.id,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
            gender: data.gender,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
          },
        })
      } else if (data.role === 'PROVIDER') {
        await tx.provider.create({
          data: {
            userId: user.id,
            title: data.title,
            specialty: data.specialty,
            licenseNumber: data.licenseNumber,
            department: data.department,
          },
        })
      }

      return user
    })

    // Generate JWT token
    const token = generateToken({
      userId: result.id,
      email: result.email,
      role: result.role,
      firstName: result.firstName,
      lastName: result.lastName,
    })

    // Create session
    await prisma.session.create({
      data: {
        userId: result.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Get user with relations
    const userWithRelations = await prisma.user.findUnique({
      where: { id: result.id },
      include: {
        patient: true,
        provider: true,
      },
    })

    const userData = {
      id: userWithRelations!.id,
      email: userWithRelations!.email,
      firstName: userWithRelations!.firstName,
      lastName: userWithRelations!.lastName,
      role: userWithRelations!.role,
      phone: userWithRelations!.phone,
      profileImage: userWithRelations!.profileImage,
      twoFAEnabled: userWithRelations!.twoFAEnabled,
      patient: userWithRelations!.patient,
      provider: userWithRelations!.provider,
    }

    return successResponse(
      {
        user: userData,
        token,
      },
      'Registration successful',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}