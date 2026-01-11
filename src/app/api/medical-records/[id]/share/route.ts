/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: share API Route
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only providers and admins can share medical records
    if (user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const recordId = params.id
    const body = await request.json()
    const { patientEmail, message } = body

    // Fetch the medical record
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
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      )
    }

    // Check permissions - providers can only share their own records
    if (user.role === 'PROVIDER' && record.providerId !== user.provider?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify that the email matches the patient's email
    if (patientEmail !== record.patient.user.email) {
      return NextResponse.json(
        { error: 'Email does not match patient record' },
        { status: 400 }
      )
    }

    // Create a secure sharing token (in production, use JWT with expiration)
    const shareToken = generateSecureToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiration

    // Store the sharing record in the database
    const sharedRecord = await prisma.sharedMedicalRecord.create({
      data: {
        recordId: recordId,
        shareToken: shareToken,
        sharedBy: user.id,
        sharedWith: record.patient.user.email,
        expiresAt: expiresAt,
        message: message || 'Your medical record has been shared with you.',
      },
    })

    // In production, you would send an actual email here
    // For now, we'll simulate the email sending process
    const emailContent = generateShareEmailContent({
      patientName: `${record.patient.user.firstName} ${record.patient.user.lastName}`,
      providerName: `Dr. ${record.provider.user.firstName} ${record.provider.user.lastName}`,
      shareToken,
      message,
      recordDate: record.createdAt,
    })

    // Log the email content for testing purposes
    console.log('Email would be sent to:', patientEmail)
    console.log('Email content:', emailContent)

    // Create a notification in the system (if you have a notifications table)
    try {
      await prisma.notification.create({
        data: {
          userId: record.patientId,
          type: 'MEDICAL_RECORD_SHARED',
          title: 'Medical Record Shared',
          message: `Dr. ${record.provider.user.firstName} ${record.provider.user.lastName} has shared your medical record from ${new Date(record.createdAt).toLocaleDateString()}.`,
          read: false,
        },
      })
    } catch (notificationError) {
      // Notifications are optional, don't fail the main operation
      console.log('Note: Notification system not available')
    }

    return NextResponse.json({
      success: true,
      message: 'Medical record shared successfully',
      data: {
        shareId: sharedRecord.id,
        expiresAt: expiresAt,
        shareLink: `${process.env.NEXT_PUBLIC_APP_URL}/shared-records/${shareToken}`,
      },
    })
  } catch (error) {
    console.error('Error sharing medical record:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSecureToken(): string {
  // In production, use a proper cryptographic library
  return Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2) +
         Date.now().toString(36)
}

function generateShareEmailContent({
  patientName,
  providerName,
  shareToken,
  message,
  recordDate,
}: {
  patientName: string
  providerName: string
  shareToken: string
  message: string
  recordDate: string
}): string {
  return `
Subject: Medical Record Shared - ${providerName}

Dear ${patientName},

${message}

Your healthcare provider, ${providerName}, has shared your medical record from ${new Date(recordDate).toLocaleDateString()} with you.

You can access your record securely using the following link:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/shared-records/${shareToken}

This link will expire in 30 days for your security.

Important Security Information:
- This link is unique to you and should not be shared with others
- The link will expire automatically for security
- If you have any concerns, please contact your healthcare provider directly

Best regards,
Your Healthcare Team

---
This is an automated message from the EHR system.
If you did not expect this message, please contact your healthcare provider.
  `.trim()
}