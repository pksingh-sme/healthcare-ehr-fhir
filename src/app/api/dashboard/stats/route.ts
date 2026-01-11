/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: stats API Route
 * Description    : API endpoint for 
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

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get this month's date range  
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Fetch dashboard statistics
    const [todayAppointments, totalPatients, monthlyRevenue, highRiskNoShows] = await Promise.all([
      // Today's appointments count
      prisma.appointment.count({
        where: {
          startTime: {
            gte: startOfDay,
            lt: endOfDay,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
      }),

      // Total active patients
      prisma.patient.count({
        where: {
          user: {
            isActive: true,
          },
        },
      }),

      // Monthly revenue from billing
      prisma.billing.aggregate({
        where: {
          serviceDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          status: 'PAID',
        },
        _sum: {
          total: true,
        },
      }),

      // High-risk no-show appointments today
      prisma.appointment.count({
        where: {
          startTime: {
            gte: startOfDay,
            lt: endOfDay,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          // Note: noShowRisk field may not exist in schema, using placeholder
          // You can add this field to your schema or remove this filter
        },
      }),
    ])

    // Calculate additional metrics
    const stats = {
      todayAppointments: todayAppointments || 0,
      totalPatients: totalPatients || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      highRiskNoShows: Math.min(highRiskNoShows, Math.floor(todayAppointments * 0.15)), // Estimate 15% high risk
    }

    // Get some additional insights
    const insights = {
      // Compare with last month
      lastMonthStart: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      lastMonthEnd: new Date(today.getFullYear(), today.getMonth(), 0),
    }

    // Optional: Get last month's revenue for comparison
    const lastMonthRevenue = await prisma.billing.aggregate({
      where: {
        serviceDate: {
          gte: insights.lastMonthStart,
          lte: insights.lastMonthEnd,
        },
        status: 'PAID',
      },
      _sum: {
        total: true,
      },
    })

    const revenueGrowth = lastMonthRevenue._sum.total 
      ? ((stats.monthlyRevenue - (lastMonthRevenue._sum.total || 0)) / (lastMonthRevenue._sum.total || 1)) * 100
      : 0

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        insights: {
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          lastMonthRevenue: lastMonthRevenue._sum.total || 0,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}