/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : DashboardStats.tsx
 * Component/Class: DashboardStats Component
 * Description    : Main dashboard component displaying clinic analytics and key metrics
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

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsProps {
  stats: {
    todayAppointments: number
    totalPatients: number
    revenue: number
    noShowRisk: number
  }
}

export function DashboardStats({ stats }: StatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      description: "Scheduled for today",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
      trend: "+12% from yesterday",
      trendColor: "text-green-600",
      bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      borderColor: "border-blue-200 dark:border-blue-700"
    },
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      description: "Active patients",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ),
      trend: "+5.2% this month",
      trendColor: "text-green-600",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-200 dark:border-green-700"
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.revenue),
      description: "This month's earnings",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      ),
      trend: "+18% from last month",
      trendColor: "text-green-600",
      bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-700"
    },
    {
      title: "High Risk No-Shows",
      value: stats.noShowRisk.toString(),
      description: "AI predictions today",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      ),
      trend: "AI powered insights",
      trendColor: "text-red-600",
      bgGradient: "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
      borderColor: "border-red-200 dark:border-red-700"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className={`card-colorful border-2 ${stat.borderColor} transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r ${stat.bgGradient} rounded-t-lg`}>
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {stat.description}
            </p>
            <div className="flex items-center">
              {stat.trendColor === 'text-green-600' && (
                <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              )}
              <p className={`text-xs font-medium ${stat.trendColor}`}>
                {stat.trend}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}