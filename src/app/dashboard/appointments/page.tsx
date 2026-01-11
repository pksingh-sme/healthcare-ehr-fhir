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

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useAuth } from '@/contexts/AuthContext'
import { formatSimpleProviderName } from '@/lib/format'

interface Appointment {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: string
  notes: string
  status: string
  noShowProbability: number
  patient: {
    id: string
    user: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
  }
  provider: {
    id: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

interface Provider {
  id: string
  firstName: string
  lastName: string
  provider?: {
    id: string
    specialty?: string
  }
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  patient?: {
    id: string
  }
}

export default function AppointmentsPage() {
  const { user, token } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    dateTime: '',
    duration: 30,
    type: '',
    notes: '',
    patientId: '',
    providerId: user?.role === 'PROVIDER' ? user?.provider?.id || '' : '',
  })

  useEffect(() => {
    if (token) {
      fetchAppointments()
      fetchProviders()
      fetchPatients()
    }
  }, [token, selectedDate])

  const fetchAppointments = async () => {
    try {
      const startDate = new Date(selectedDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      console.log('Fetching providers...')
      const response = await fetch('/api/users?role=PROVIDER', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Providers response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Providers response data:', data)
        
        // Transform the data to match our interface
        const transformedProviders = data.data?.map((user: any) => ({
          id: user.provider?.id || user.id, // Use provider.id if available, fallback to user.id
          firstName: user.firstName,
          lastName: user.lastName,
          provider: user.provider
        })) || []
        
        console.log('Transformed providers:', transformedProviders)
        setProviders(transformedProviders)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch providers:', errorData)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const fetchPatients = async () => {
    try {
      console.log('Fetching patients...')
      const response = await fetch('/api/users?role=PATIENT', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Patients response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Patients response data:', data)
        
        // Transform the data to match our interface
        const transformedPatients = data.data?.map((user: any) => ({
          id: user.patient?.id || user.id, // Use patient.id if available, fallback to user.id
          firstName: user.firstName,
          lastName: user.lastName,
          patient: user.patient
        })) || []
        
        console.log('Transformed patients:', transformedPatients)
        setPatients(transformedPatients)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch patients:', errorData)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate required fields
      if (!newAppointment.dateTime) {
        alert('Please select a date and time')
        return
      }
      if (!newAppointment.patientId) {
        alert('Please select a patient')
        return
      }
      if (!newAppointment.providerId) {
        alert('Please select a provider')
        return
      }
      if (!newAppointment.type) {
        alert('Please select an appointment type')
        return
      }
      
      console.log('Creating appointment with data:', newAppointment)
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newAppointment),
      })

      console.log('Create appointment response status:', response.status)
      
      const responseData = await response.json()
      console.log('Create appointment response data:', responseData)

      if (response.ok) {
        console.log('Appointment created successfully')
        alert('Appointment created successfully!')
        setShowNewAppointment(false)
        setNewAppointment({
          dateTime: '',
          duration: 30,
          type: '',
          notes: '',
          patientId: '',
          providerId: user?.role === 'PROVIDER' ? user?.provider?.id || '' : '',
        })
        fetchAppointments()
      } else {
        console.error('Failed to create appointment:', responseData)
        alert(responseData.error || 'Failed to create appointment')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Failed to create appointment: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      CONFIRMED: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      NO_SHOW: { color: 'bg-red-100 text-red-800', label: 'No Show' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getRiskBadge = (risk: number) => {
    if (risk >= 0.7) {
      return <Badge className="bg-red-100 text-red-800">High Risk ({Math.round(risk * 100)}%)</Badge>
    } else if (risk >= 0.4) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk ({Math.round(risk * 100)}%)</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Low Risk ({Math.round(risk * 100)}%)</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 dark:border-purple-700 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400"></div>
            <div className="absolute inset-0 w-16 h-16 m-2 border-4 border-pink-200 dark:border-pink-700 rounded-full animate-spin border-t-pink-600 dark:border-t-pink-400" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-6 h-6 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-white via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-indigo-900/30 dark:to-purple-900/30 shadow-lg border border-indigo-100 dark:border-indigo-800">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
              <svg className="w-10 h-10 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointments
            </h1>
            <p className="text-indigo-600 dark:text-indigo-300 mt-2 font-medium text-lg">
              Manage patient appointments and scheduling
            </p>
          </div>
          <Button
            onClick={() => setShowNewAppointment(true)}
            className="clinic-gradient text-white shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1 card-colorful border-2 border-purple-200 dark:border-purple-700">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
              <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-300">
                Select a date to view appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                onChange={(date) => setSelectedDate(date as Date)}
                value={selectedDate}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="lg:col-span-2 card-colorful border-2 border-blue-200 dark:border-blue-700">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
              <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Appointments for {selectedDate.toLocaleDateString()}
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                {appointments.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments scheduled for this date
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>No-Show Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {new Date(appointment.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                        </TableCell>
                        <TableCell>
                          {appointment.provider.user.firstName} {appointment.provider.user.lastName}
                        </TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>{getRiskBadge(appointment.noShowProbability)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* New Appointment Modal */}
        {showNewAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
              <CardHeader>
                <CardTitle>New Appointment</CardTitle>
                <CardDescription>
                  Schedule a new patient appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateTime">Date & Time</Label>
                    <Input
                      id="dateTime"
                      type="datetime-local"
                      value={newAppointment.dateTime}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, dateTime: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient</Label>
                    <Select
                      value={newAppointment.patientId}
                      onValueChange={(value: string) =>
                        setNewAppointment({ ...newAppointment, patientId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.patient?.id || patient.id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="providerId">Provider</Label>
                    <Select
                      value={newAppointment.providerId}
                      onValueChange={(value: string) =>
                        setNewAppointment({ ...newAppointment, providerId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.provider?.id || provider.id}>
                            {provider.firstName} {provider.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Appointment Type</Label>
                    <Select
                      value={newAppointment.type}
                      onValueChange={(value: string) =>
                        setNewAppointment({ ...newAppointment, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkup">Annual Checkup</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="procedure">Procedure</SelectItem>
                        <SelectItem value="therapy">Therapy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={newAppointment.duration.toString()}
                      onValueChange={(value: string) =>
                        setNewAppointment({ ...newAppointment, duration: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes or instructions"
                      value={newAppointment.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNewAppointment({ ...newAppointment, notes: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="clinic-gradient text-white flex-1">
                      Create Appointment
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewAppointment(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}