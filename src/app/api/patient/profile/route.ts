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

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: patient.id,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zipCode: patient.zipCode,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,
        insuranceType: patient.insuranceType,
        insuranceProvider: patient.insuranceProvider,
        allergies: patient.allergies,
        medications: patient.medications,
        medicalHistory: patient.medicalHistory,
        user: patient.user,
      },
    })
  } catch (error) {
    console.error('Error fetching patient profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      emergencyPhone,
      allergies,
      medications,
    } = body

    const updatedPatient = await prisma.patient.update({
      where: { userId: user.id },
      data: {
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(emergencyContact && { emergencyContact }),
        ...(emergencyPhone && { emergencyPhone }),
        ...(allergies !== undefined && { allergies }),
        ...(medications !== undefined && { medications }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPatient.id,
        dateOfBirth: updatedPatient.dateOfBirth,
        gender: updatedPatient.gender,
        address: updatedPatient.address,
        city: updatedPatient.city,
        state: updatedPatient.state,
        zipCode: updatedPatient.zipCode,
        emergencyContact: updatedPatient.emergencyContact,
        emergencyPhone: updatedPatient.emergencyPhone,
        insuranceType: updatedPatient.insuranceType,
        insuranceProvider: updatedPatient.insuranceProvider,
        allergies: updatedPatient.allergies,
        medications: updatedPatient.medications,
        user: updatedPatient.user,
      },
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Error updating patient profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}