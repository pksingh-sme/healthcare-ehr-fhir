/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: [id] API Route
 * Description    : Electronic Health Records (EHR) API for patient medical data management
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only providers and admins can update medical records
    if (user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const recordId = params.id
    const body = await request.json()
    const {
      chiefComplaint,
      diagnosis,
      treatment,
      notes,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      weight,
      height,
      labResults,
      prescriptions,
    } = body

    // Check if the record exists and if the user has permission to update it
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      )
    }

    // Providers can only update their own records, admins can update any
    if (user.role === 'PROVIDER' && existingRecord.providerId !== user.provider?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Recalculate readmission risk based on updated data
    let readmissionRisk = 0.1 // Base risk

    // Increase risk based on vital signs
    if (bloodPressureSystolic && bloodPressureSystolic > 140) {
      readmissionRisk += 0.2
    }
    if (heartRate && (heartRate > 100 || heartRate < 60)) {
      readmissionRisk += 0.15
    }
    if (temperature && temperature > 100.4) {
      readmissionRisk += 0.25
    }

    // Increase risk based on diagnosis keywords
    const diagnosis_lower = diagnosis?.toLowerCase() || ''
    if (diagnosis_lower.includes('diabetes') || diagnosis_lower.includes('heart') || diagnosis_lower.includes('chronic')) {
      readmissionRisk += 0.3
    }

    // Cap at 1.0
    readmissionRisk = Math.min(readmissionRisk, 1.0)

    // Update suggested ICD-10/CPT codes based on diagnosis and treatment
    const suggestedCodes = []
    if (diagnosis_lower.includes('diabetes')) {
      suggestedCodes.push('E11.9 - Type 2 diabetes mellitus without complications')
    }
    if (diagnosis_lower.includes('hypertension') || diagnosis_lower.includes('high blood pressure')) {
      suggestedCodes.push('I10 - Essential hypertension')
    }
    if (diagnosis_lower.includes('flu') || diagnosis_lower.includes('influenza')) {
      suggestedCodes.push('J09.X2 - Influenza due to identified novel influenza A virus')
    }
    if (treatment?.toLowerCase().includes('consultation')) {
      suggestedCodes.push('99213 - Office or other outpatient visit')
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        chiefComplaint: chiefComplaint || undefined,
        diagnosis: diagnosis || undefined,
        treatment: treatment || undefined,
        notes: notes || undefined,
        bloodPressureSystolic: bloodPressureSystolic || undefined,
        bloodPressureDiastolic: bloodPressureDiastolic || undefined,
        heartRate: heartRate || undefined,
        temperature: temperature || undefined,
        weight: weight || undefined,
        height: height || undefined,
        labResults: labResults || undefined,
        prescriptions: prescriptions || undefined,
        readmissionRisk,
        suggestedCodes: suggestedCodes.length > 0 ? suggestedCodes.join('; ') : undefined,
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointment: {
          select: {
            title: true,
            startTime: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedRecord,
    })
  } catch (error) {
    console.error('Error updating medical record:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordId = params.id

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointment: {
          select: {
            title: true,
            startTime: true,
          },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (user.role === 'PATIENT' && record.patient.user.email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (user.role === 'PROVIDER' && record.providerId !== user.provider?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: record,
    })
  } catch (error) {
    console.error('Error fetching medical record:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}