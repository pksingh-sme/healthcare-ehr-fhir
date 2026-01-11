/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: billing API Route
 * Description    : Billing and payment processing API endpoints with Stripe integration
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
import { BillingStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    let whereClause: any = {}

    if (user.role === 'PATIENT') {
      // Patients can only see their own billing records
      whereClause.patientId = user.patient?.id
    } else if (patientId && (user.role === 'ADMIN' || user.role === 'PROVIDER')) {
      // Providers/Admins can see specific patient's records
      whereClause.patientId = patientId
    }
    // Admins can see all records if no patientId specified

    const billingRecords = await prisma.billing.findMany({
      where: whereClause,
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
        appointment: {
          select: {
            title: true,
            startTime: true,
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
        },
      },
      orderBy: {
        serviceDate: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: billingRecords,
    })
  } catch (error) {
    console.error('Error fetching billing records:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only providers and admins can create billing records
    if (user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      patientId,
      appointmentId,
      serviceDescription,
      serviceDate,
      subtotal,
      tax = 0,
      icdCodes = [],
      cptCodes = [],
    } = body

    // Validate required fields
    if (!patientId || !serviceDescription || !subtotal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const total = subtotal + tax

    // AI Stub: Auto-suggest ICD-10/CPT codes based on service description
    const suggestedCodes = {
      icd: serviceDescription.toLowerCase().includes('flu') ? ['J09.X2'] : [],
      cpt: serviceDescription.toLowerCase().includes('consultation') ? ['99213'] : [],
    }

    const billing = await prisma.billing.create({
      data: {
        patientId,
        appointmentId: appointmentId || undefined,
        invoiceNumber,
        serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
        serviceDescription,
        icdCodes: JSON.stringify([...icdCodes, ...suggestedCodes.icd]),
        cptCodes: JSON.stringify([...cptCodes, ...suggestedCodes.cpt]),
        subtotal,
        tax,
        total,
        status: BillingStatus.PENDING,
        insuranceBilled: 0,
        patientResponsibility: total,
        paidAmount: 0,
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
      data: billing,
      message: 'Billing record created successfully',
    })
  } catch (error) {
    console.error('Error creating billing record:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { billingId, paymentMethod, paidAmount } = body

    if (!billingId) {
      return NextResponse.json(
        { error: 'Billing ID is required' },
        { status: 400 }
      )
    }

    // Get the billing record
    const billing = await prisma.billing.findUnique({
      where: { id: billingId },
    })

    if (!billing) {
      return NextResponse.json({ error: 'Billing record not found' }, { status: 404 })
    }

    // Check permissions
    if (user.role === 'PATIENT' && billing.patientId !== user.patient?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate new status based on payment
    let newStatus = billing.status
    if (paidAmount >= billing.total) {
      newStatus = BillingStatus.PAID
    } else if (paidAmount > 0) {
      newStatus = BillingStatus.PENDING // Could be PARTIAL if we had that status
    }

    const updatedBilling = await prisma.billing.update({
      where: { id: billingId },
      data: {
        ...(paymentMethod && { paymentMethod }),
        ...(paidAmount !== undefined && {
          paidAmount: billing.paidAmount + paidAmount,
          paymentDate: new Date(),
        }),
        status: newStatus,
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
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedBilling,
      message: 'Payment processed successfully',
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}