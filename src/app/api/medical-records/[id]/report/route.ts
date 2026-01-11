/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: report API Route
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
import { formatSimpleProviderName } from '@/lib/format'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only providers and admins can generate reports
    if (user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const recordId = params.id

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
                phone: true,
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

    // Check permissions - providers can only generate reports for their own records
    if (user.role === 'PROVIDER' && record.providerId !== user.provider?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate HTML content for the report
    const htmlContent = generateReportHTML(record)

    // For now, return the HTML content as a text file
    // In production, you would use a library like Puppeteer or jsPDF to generate actual PDF
    const reportContent = `
MEDICAL RECORD REPORT
=====================

Generated: ${new Date().toLocaleString()}
Report ID: ${recordId}

PATIENT INFORMATION
-------------------
Name: ${record.patient.user.firstName} ${record.patient.user.lastName}
Email: ${record.patient.user.email}
Phone: ${record.patient.user.phone || 'Not provided'}

PROVIDER INFORMATION
--------------------
Provider: ${formatSimpleProviderName(record.provider.user.firstName, record.provider.user.lastName)}
Record Date: ${new Date(record.createdAt).toLocaleString()}

CLINICAL INFORMATION
--------------------
${record.chiefComplaint ? `Chief Complaint: ${record.chiefComplaint}\n` : ''}
${record.diagnosis ? `Diagnosis: ${record.diagnosis}\n` : ''}
${record.treatment ? `Treatment Plan: ${record.treatment}\n` : ''}

VITAL SIGNS
-----------
${record.bloodPressureSystolic && record.bloodPressureDiastolic ? 
  `Blood Pressure: ${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg\n` : ''}
${record.heartRate ? `Heart Rate: ${record.heartRate} bpm\n` : ''}
${record.temperature ? `Temperature: ${record.temperature}°F\n` : ''}
${record.weight ? `Weight: ${record.weight} lbs\n` : ''}
${record.height ? `Height: ${record.height} inches\n` : ''}

CLINICAL DATA
-------------
${record.labResults ? `Lab Results:\n${record.labResults}\n\n` : ''}
${record.prescriptions ? `Prescriptions:\n${record.prescriptions}\n\n` : ''}
${record.notes ? `Clinical Notes:\n${record.notes}\n\n` : ''}

AI INSIGHTS
-----------
Readmission Risk: ${Math.round(record.readmissionRisk * 100)}%
${record.suggestedCodes ? `Suggested Codes: ${record.suggestedCodes}\n` : ''}

---
This report was generated automatically by the EHR system.
For questions, please contact your healthcare provider.
    `.trim()

    // Return as downloadable text file (in production, this would be PDF)
    return new NextResponse(reportContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="medical-report-${recordId}.txt"`,
      },
    })
  } catch (error) {
    console.error('Error generating medical report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateReportHTML(record: any): string {
  // This would generate proper HTML for PDF conversion in production
  return `
    <html>
      <head>
        <title>Medical Report - ${record.patient.user.firstName} ${record.patient.user.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Medical Record Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        <!-- Report content would go here -->
      </body>
    </html>
  `
}