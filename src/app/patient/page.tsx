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
import { useAuth } from '@/contexts/AuthContext'
import { formatSimpleProviderName } from '@/lib/format'
import { SocketProvider } from '@/contexts/SocketContext'
import { MessagingCenter } from '@/components/realtime/MessagingCenter'

// Inline Dialog Components to replace problematic import
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-2xl mx-4">{children}</div>
    </div>
  )
}

function DialogContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`modal-colorful p-6 ${className}`}>{children}</div>
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2 mb-4">{children}</div>
}

function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{children}</h2>
}

function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-purple-600 dark:text-purple-300">{children}</p>
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from 'next/navigation'

interface PatientProfile {
  id: string
  dateOfBirth: string
  gender?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContact?: string
  emergencyPhone?: string
  insuranceType: string
  insuranceProvider?: string
  allergies?: string
  medications?: string
}

interface Appointment {
  id: string
  title: string
  startTime: string
  endTime: string
  status: string
  type?: string
  provider: {
    user: {
      firstName: string
      lastName: string
    }
  }
}

interface BillingRecord {
  id: string
  invoiceNumber: string
  serviceDate: string
  serviceDescription: string
  total: number
  status: string
  paidAmount: number
}

export default function PatientPortal() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedBillingRecord, setSelectedBillingRecord] = useState<BillingRecord | null>(null)

  // Persist active tab in localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('patient-active-tab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    localStorage.setItem('patient-active-tab', newTab)
  }

  // Redirect non-patients
  useEffect(() => {
    if (user && user.role !== 'PATIENT') {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    if (token && user?.role === 'PATIENT') {
      fetchPatientData()
    }
  }, [token, user])

  const fetchPatientData = async () => {
    try {
      await Promise.all([
        fetchProfile(),
        fetchAppointments(),
        fetchBillingRecords(),
      ])
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/patient/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const fetchBillingRecords = async () => {
    try {
      const response = await fetch('/api/billing', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setBillingRecords(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching billing records:', error)
    }
  }

  const updateProfile = async (updatedProfile: Partial<PatientProfile>) => {
    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      CONFIRMED: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getBillingStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      OVERDUE: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
      PARTIAL: { color: 'bg-orange-100 text-orange-800', label: 'Partial' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'PATIENT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md card-colorful">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Access Denied</CardTitle>
            <CardDescription>
              This page is only accessible to patients.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-purple-900/30 dark:to-blue-900/30 shadow-lg border border-purple-100 dark:border-purple-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Patient Portal</h1>
              <p className="text-blue-600 dark:text-blue-300 mt-1 font-medium">
                Welcome back, {user.firstName}! Manage your healthcare information.
              </p>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '/login'
              }}
              className="logout-button"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-xl border-2 border-purple-200 dark:border-purple-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium">Profile</TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-medium">Appointments</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium">Messages</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-medium">Billing</TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium">Records</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="card-colorful border-2 border-purple-200 dark:border-purple-700">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
                <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Personal Information</CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-300">
                  Manage your personal details and medical information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={user.firstName}
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={user.lastName}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={user.phone || ''}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profile.gender || ''}
                        onValueChange={(value) => setProfile({ ...profile, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={profile.emergencyContact || ''}
                        onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={profile.emergencyPhone || ''}
                        onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea
                        id="allergies"
                        placeholder="List any known allergies"
                        value={profile.allergies || ''}
                        onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="medications">Current Medications</Label>
                      <Textarea
                        id="medications"
                        placeholder="List current medications"
                        value={profile.medications || ''}
                        onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => profile && updateProfile(profile)}
                  className="clinic-gradient text-white"
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="card-colorful border-2 border-purple-200 dark:border-purple-700">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
                <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">My Appointments</CardTitle>
                <CardDescription className="text-purple-600 dark:text-purple-300">
                  View and manage your upcoming appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {new Date(appointment.startTime).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formatSimpleProviderName(appointment.provider.user.firstName, appointment.provider.user.lastName)}
                          </TableCell>
                          <TableCell>{appointment.type || appointment.title}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="card-colorful border-2 border-pink-200 dark:border-pink-700">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-t-lg">
                <CardTitle className="text-xl bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Messages</CardTitle>
                <CardDescription className="text-pink-600 dark:text-pink-300">
                  Secure real-time communication with your healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocketProvider>
                  <MessagingCenter />
                </SocketProvider>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="card-colorful border-2 border-green-200 dark:border-green-700">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-lg">
                <CardTitle className="text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Billing & Payments</CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300">
                  View your bills and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No billing records found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Service Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.invoiceNumber}</TableCell>
                          <TableCell>{new Date(record.serviceDate).toLocaleDateString()}</TableCell>
                          <TableCell>{record.serviceDescription}</TableCell>
                          <TableCell>${record.total.toFixed(2)}</TableCell>
                          <TableCell>{getBillingStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedBillingRecord(record)}
                            >
                              {record.status === 'PENDING' ? 'Pay Now' : 'View Details'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records">
            <Card className="card-colorful border-2 border-indigo-200 dark:border-indigo-700">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-lg">
                <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Medical Records</CardTitle>
                <CardDescription className="text-indigo-600 dark:text-indigo-300">
                  Access your medical history and test results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Medical records will be available after your first visit</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your healthcare provider will upload your medical records here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about your appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Appointment Title</Label>
                  <p className="text-sm">{selectedAppointment.title}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <p className="text-sm">{selectedAppointment.type || 'General Consultation'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Date & Start Time</Label>
                  <p className="text-sm">{new Date(selectedAppointment.startTime).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">End Time</Label>
                  <p className="text-sm">{new Date(selectedAppointment.endTime).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p className="text-sm">
                    {Math.round((new Date(selectedAppointment.endTime).getTime() - new Date(selectedAppointment.startTime).getTime()) / (1000 * 60))} minutes
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Healthcare Provider</Label>
                  <p className="text-sm">Dr. {selectedAppointment.provider.user.firstName} {selectedAppointment.provider.user.lastName}</p>
                </div>
              </div>
              
              {selectedAppointment.status === 'SCHEDULED' && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Preparation Instructions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Please arrive 15 minutes early for check-in</li>
                    <li>• Bring a valid photo ID and insurance card</li>
                    <li>• Prepare a list of current medications</li>
                    <li>• Write down any questions or concerns you'd like to discuss</li>
                  </ul>
                </div>
              )}
              
              <div className="border-t pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
                {selectedAppointment.status === 'SCHEDULED' && (
                  <Button variant="destructive">
                    Cancel Appointment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Billing Details Modal */}
      <Dialog open={!!selectedBillingRecord} onOpenChange={() => setSelectedBillingRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Billing Details</DialogTitle>
            <DialogDescription>
              Complete billing information and payment details
            </DialogDescription>
          </DialogHeader>
          {selectedBillingRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Invoice Number</Label>
                  <p className="text-sm font-mono">{selectedBillingRecord.invoiceNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Service Date</Label>
                  <p className="text-sm">{new Date(selectedBillingRecord.serviceDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Service Description</Label>
                  <p className="text-sm">{selectedBillingRecord.serviceDescription}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div>{getBillingStatusBadge(selectedBillingRecord.status)}</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${selectedBillingRecord.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Amount Paid:</span>
                    <span className="text-green-600">${selectedBillingRecord.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Balance Due:</span>
                    <span className={`${selectedBillingRecord.total - selectedBillingRecord.paidAmount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(selectedBillingRecord.total - selectedBillingRecord.paidAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedBillingRecord.status === 'PENDING' && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Options</h4>
                  <div className="space-y-2">
                    <Button className="w-full clinic-gradient text-white">
                      Pay with Credit Card
                    </Button>
                    <Button variant="outline" className="w-full">
                      Set Up Payment Plan
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedBillingRecord(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  Download Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}