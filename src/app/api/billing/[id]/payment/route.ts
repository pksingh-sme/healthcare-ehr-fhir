/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: payment API Route
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only providers and admins can process payments
    if (user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const billingId = params.id
    const body = await request.json()
    const { amount, paymentMethod, notes } = body

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Payment amount and method are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Fetch the existing billing record
    const existingRecord = await prisma.billing.findUnique({
      where: { id: billingId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Billing record not found' },
        { status: 404 }
      )
    }

    // Check if payment amount exceeds remaining balance
    const remainingBalance = existingRecord.total - existingRecord.paidAmount
    if (amount > remainingBalance) {
      return NextResponse.json(
        { error: `Payment amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Calculate new paid amount and determine new status
    const newPaidAmount = existingRecord.paidAmount + amount
    let newStatus = existingRecord.status

    // Update status based on payment completion
    if (newPaidAmount >= existingRecord.total - 0.01) { // Allow for rounding differences
      newStatus = 'PAID'
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL'
    }

    // Update the billing record
    const updatedRecord = await prisma.billing.update({
      where: { id: billingId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentMethod: paymentMethod,
        paymentDate: new Date(),
        notes: notes ? `${existingRecord.notes || ''}\n\nPayment Record: $${amount} paid via ${paymentMethod} on ${new Date().toLocaleDateString()}${notes ? ` - ${notes}` : ''}`.trim() : existingRecord.notes,
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
        appointment: {
          select: {
            title: true,
            startTime: true,
          },
        },
      },
    })

    // Create a payment history record (future enhancement)
    // Note: Payment history table not implemented yet
    console.log(`Payment history: $${amount} paid via ${paymentMethod} by ${user.firstName} ${user.lastName}`)

    // Create a notification for the patient (future enhancement) 
    // Note: Notification system not implemented yet
    console.log(`Notification: Payment of $${amount.toFixed(2)} received for ${existingRecord.patient.user.firstName} ${existingRecord.patient.user.lastName}`)

    // In production, you might want to send an email receipt
    console.log(`Payment processed: $${amount} for ${existingRecord.patient.user.firstName} ${existingRecord.patient.user.lastName}`)

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        ...updatedRecord,
        paymentAmount: amount,
        newBalance: existingRecord.total - newPaidAmount,
        paymentProgress: (newPaidAmount / existingRecord.total) * 100,
      },
    })
  } catch (error) {
    console.error('Error processing payment:', error)
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

    const billingId = params.id

    // Fetch payment history for the billing record
    // Note: Payment history table not implemented yet
    // In future versions, this would return actual payment history
    const billingRecord = await prisma.billing.findUnique({
      where: { id: billingId },
      select: {
        paidAmount: true,
        total: true,
        paymentMethod: true,
        paymentDate: true,
        status: true,
      },
    })

    if (!billingRecord) {
      return NextResponse.json(
        { error: 'Billing record not found' },
        { status: 404 }
      )
    }

    // Return mock payment history based on current payment info
    const mockPaymentHistory = billingRecord.paidAmount > 0 ? [
      {
        id: `mock-${billingId}`,
        amount: billingRecord.paidAmount,
        paymentMethod: billingRecord.paymentMethod || 'Unknown',
        processedAt: billingRecord.paymentDate || new Date(),
        notes: 'Payment recorded',
      },
    ] : []

    return NextResponse.json({
      success: true,
      data: mockPaymentHistory,
      message: 'Payment history (simplified view)',
    })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}