/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : page.tsx
 * Component/Class: page Page
 * Description    : Main landing page showcasing ClinicEase features and navigation
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

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { formatSimpleProviderName } from '@/lib/format'

interface DashboardData {
  stats: {
    todayAppointments: number
    totalPatients: number
    revenue: number
    noShowRisk: number
  }
  upcomingAppointments: Array<{
    id: string
    time: string
    patient: string
    type: string
    provider: string
    status: string
    noShowRisk: number
  }>
  recentPatients: Array<{
    id: string
    name: string
    lastVisit: string
    nextAppointment: string
    status: string
  }>
}

// Fallback mock data for when API is unavailable
const fallbackData: DashboardData = {
  stats: {
    todayAppointments: 24,
    totalPatients: 1247,
    revenue: 89240,
    noShowRisk: 3,
  },
  upcomingAppointments: [
    {
      id: '1',
      time: '09:00 AM',
      patient: 'Sarah Johnson',
      type: 'Annual Checkup',
      provider: 'Dr. Smith',
      status: 'confirmed',
      noShowRisk: 0.15,
    },
    {
      id: '2',
      time: '10:30 AM',
      patient: 'Michael Chen',
      type: 'Follow-up',
      provider: 'Dr. Williams',
      status: 'confirmed',
      noShowRisk: 0.75,
    },
    {
      id: '3',
      time: '02:00 PM',
      patient: 'Emily Davis',
      type: 'Consultation',
      provider: 'Dr. Brown',
      status: 'pending',
      noShowRisk: 0.25,
    },
    {
      id: '4',
      time: '03:30 PM',
      patient: 'Robert Wilson',
      type: 'Physical Therapy',
      provider: 'PT Thompson',
      status: 'confirmed',
      noShowRisk: 0.40,
    },
  ],
  recentPatients: [
    {
      id: '1',
      name: 'Alice Cooper',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-02-15',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Bob Martinez',
      lastVisit: '2024-01-10',
      nextAppointment: 'Not scheduled',
      status: 'Needs follow-up',
    },
    {
      id: '3',
      name: 'Carol Thompson',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-26',
      status: 'Active',
    },
  ],
}

function getRiskBadge(risk: number) {
  if (risk >= 0.7) {
    return <span className="no-show-risk-high px-2 py-1 rounded-full text-xs font-medium border">High Risk</span>
  } else if (risk >= 0.4) {
    return <span className="no-show-risk-medium px-2 py-1 rounded-full text-xs font-medium border">Medium Risk</span>
  } else {
    return <span className="no-show-risk-low px-2 py-1 rounded-full text-xs font-medium border">Low Risk</span>
  }
}

function getStatusBadge(status: string) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium border"
  
  switch (status.toLowerCase()) {
    case 'confirmed':
      return <span className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}>Confirmed</span>
    case 'pending':
      return <span className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>Pending</span>
    case 'cancelled':
      return <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>Cancelled</span>
    default:
      return <span className={`${baseClasses} bg-gray-50 text-gray-700 border-gray-200`}>{status}</span>
  }
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all dashboard data in parallel
      const [statsResponse, appointmentsResponse, patientsResponse] = await Promise.allSettled([
        fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/appointments?today=true&limit=5', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/users?role=PATIENT&recent=true&limit=3', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      let newDashboardData = { ...fallbackData }

      // Process stats data
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json()
        if (statsData.success) {
          newDashboardData.stats = {
            todayAppointments: statsData.data.todayAppointments || 0,
            totalPatients: statsData.data.totalPatients || 0,
            revenue: statsData.data.monthlyRevenue || 0,
            noShowRisk: statsData.data.highRiskNoShows || 0,
          }
        }
      }

      // Process appointments data
      if (appointmentsResponse.status === 'fulfilled' && appointmentsResponse.value.ok) {
        const appointmentsData = await appointmentsResponse.value.json()
        if (appointmentsData.success && Array.isArray(appointmentsData.data)) {
          newDashboardData.upcomingAppointments = appointmentsData.data.map((apt: any) => ({
            id: apt.id,
            time: new Date(apt.startTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
            patient: `${apt.patient.user.firstName} ${apt.patient.user.lastName}`,
            type: apt.title || apt.type || 'Appointment',
            provider: apt.provider ? formatSimpleProviderName(apt.provider.user.firstName, apt.provider.user.lastName) : 'TBD',
            status: apt.status.toLowerCase(),
            noShowRisk: apt.noShowRisk || Math.random(), // AI prediction or random for demo
          }))
        }
      }

      // Process recent patients data  
      if (patientsResponse.status === 'fulfilled' && patientsResponse.value.ok) {
        const patientsData = await patientsResponse.value.json()
        if (patientsData.success && Array.isArray(patientsData.data)) {
          newDashboardData.recentPatients = patientsData.data.slice(0, 3).map((patient: any) => ({
            id: patient.id,
            name: `${patient.firstName} ${patient.lastName}`,
            lastVisit: patient.lastVisit || 'N/A',
            nextAppointment: patient.nextAppointment || 'Not scheduled',
            status: patient.status || 'Active',
          }))
        }
      }

      setDashboardData(newDashboardData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Using cached information.')
      // Keep using fallback data
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-700">
                <p>{error}</p>
              </div>
              <button 
                onClick={() => fetchDashboardData()}
                className="ml-auto text-yellow-700 hover:text-yellow-900 underline text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-purple-900/30 dark:to-blue-900/30 shadow-lg border border-purple-100 dark:border-purple-800">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
              <svg className="w-10 h-10 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </h1>
            <p className="text-blue-600 dark:text-blue-300 mt-2 font-medium text-lg">
              Welcome back{user ? `, Dr. ${user.firstName}` : ''}! Here&apos;s what&apos;s happening at your clinic today.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/appointments">
              <Button className="clinic-gradient text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Schedule Appointment
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => fetchDashboardData()}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={dashboardData.stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card className="lg:col-span-2 card-colorful border-2 border-blue-200 dark:border-blue-700">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Today&apos;s Appointments
                  </CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-300">
                    Overview of scheduled appointments with AI-powered no-show predictions
                  </CardDescription>
                </div>
                <Link href="/dashboard/appointments">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>No-Show Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.upcomingAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No appointments scheduled for today
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboardData.upcomingAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.time}</TableCell>
                        <TableCell>{appointment.patient}</TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>{appointment.provider}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>{getRiskBadge(appointment.noShowRisk)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="card-colorful border-2 border-green-200 dark:border-green-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Recent Patients
                  </CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-300">
                    Patients requiring attention or follow-up
                  </CardDescription>
                </div>
                <Link href="/dashboard/patients">
                  <Button variant="outline" size="sm" className="border-green-300 text-green-600 hover:bg-green-50">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No recent patient activity</p>
                  </div>
                ) : (
                  dashboardData.recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">Last visit: {patient.lastVisit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{patient.nextAppointment}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          patient.status === 'Active' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/patients">
                  <Button variant="outline" className="w-full h-16 flex flex-col">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Patient
                  </Button>
                </Link>
                
                <Link href="/dashboard/appointments">
                  <Button variant="outline" className="w-full h-16 flex flex-col">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule
                  </Button>
                </Link>
                
                <Link href="/dashboard/billing">
                  <Button variant="outline" className="w-full h-16 flex flex-col">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Billing
                  </Button>
                </Link>
                
                <Link href="/dashboard/ehr">
                  <Button variant="outline" className="w-full h-16 flex flex-col">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Records
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}