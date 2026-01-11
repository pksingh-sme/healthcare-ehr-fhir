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
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { formatSimpleProviderName } from '@/lib/format'

interface MedicalRecord {
  id: string
  patientId: string
  providerId: string
  appointmentId?: string
  chiefComplaint?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  labResults?: string
  prescriptions?: string
  readmissionRisk: number
  suggestedCodes?: string
  createdAt: string
  updatedAt: string
  patient: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  provider: {
    user: {
      firstName: string
      lastName: string
    }
  }
  appointment?: {
    title: string
    startTime: string
  }
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phone?: string
  patient?: {
    id: string
    dateOfBirth?: string
    insuranceProvider?: string
  }
}

export default function EHRPage() {
  const { user, token } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showNewRecord, setShowNewRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareRecord, setShareRecord] = useState<MedicalRecord | null>(null)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    labResults: '',
    prescriptions: '',
  })

  useEffect(() => {
    if (token) {
      fetchRecords()
      fetchPatients()
    }
  }, [token])

  const fetchRecords = async () => {
    try {
      const url = selectedPatient && selectedPatient !== 'all' 
        ? `/api/medical-records?patientId=${selectedPatient}`
        : '/api/medical-records'
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecords(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching medical records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/users?role=PATIENT', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const createRecord = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newRecord,
          bloodPressureSystolic: newRecord.bloodPressureSystolic ? parseInt(newRecord.bloodPressureSystolic) : undefined,
          bloodPressureDiastolic: newRecord.bloodPressureDiastolic ? parseInt(newRecord.bloodPressureDiastolic) : undefined,
          heartRate: newRecord.heartRate ? parseInt(newRecord.heartRate) : undefined,
          temperature: newRecord.temperature ? parseFloat(newRecord.temperature) : undefined,
          weight: newRecord.weight ? parseFloat(newRecord.weight) : undefined,
          height: newRecord.height ? parseFloat(newRecord.height) : undefined,
        }),
      })

      if (response.ok) {
        setShowNewRecord(false)
        setNewRecord({
          patientId: '',
          chiefComplaint: '',
          diagnosis: '',
          treatment: '',
          notes: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: '',
          labResults: '',
          prescriptions: '',
        })
        fetchRecords()
        alert('Medical record created successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create medical record')
      }
    } catch (error) {
      console.error('Error creating medical record:', error)
      alert('Failed to create medical record')
    }
  }

  const getRiskBadge = (risk: number) => {
    if (risk >= 0.7) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk ({Math.round(risk * 100)}%)</Badge>
    } else if (risk >= 0.4) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk ({Math.round(risk * 100)}%)</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk ({Math.round(risk * 100)}%)</Badge>
    }
  }

  const formatVitals = (record: MedicalRecord) => {
    const vitals = []
    if (record.bloodPressureSystolic && record.bloodPressureDiastolic) {
      vitals.push(`BP: ${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`)
    }
    if (record.heartRate) {
      vitals.push(`HR: ${record.heartRate}`)
    }
    if (record.temperature) {
      vitals.push(`Temp: ${record.temperature}°F`)
    }
    if (record.weight) {
      vitals.push(`Weight: ${record.weight} lbs`)
    }
    return vitals.join(' • ')
  }

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record)
    setNewRecord({
      patientId: record.patientId,
      chiefComplaint: record.chiefComplaint || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      notes: record.notes || '',
      bloodPressureSystolic: record.bloodPressureSystolic?.toString() || '',
      bloodPressureDiastolic: record.bloodPressureDiastolic?.toString() || '',
      heartRate: record.heartRate?.toString() || '',
      temperature: record.temperature?.toString() || '',
      weight: record.weight?.toString() || '',
      height: record.height?.toString() || '',
      labResults: record.labResults || '',
      prescriptions: record.prescriptions || '',
    })
  }

  const updateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return

    try {
      const response = await fetch(`/api/medical-records/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newRecord,
          bloodPressureSystolic: newRecord.bloodPressureSystolic ? parseInt(newRecord.bloodPressureSystolic) : undefined,
          bloodPressureDiastolic: newRecord.bloodPressureDiastolic ? parseInt(newRecord.bloodPressureDiastolic) : undefined,
          heartRate: newRecord.heartRate ? parseInt(newRecord.heartRate) : undefined,
          temperature: newRecord.temperature ? parseFloat(newRecord.temperature) : undefined,
          weight: newRecord.weight ? parseFloat(newRecord.weight) : undefined,
          height: newRecord.height ? parseFloat(newRecord.height) : undefined,
        }),
      })

      if (response.ok) {
        setEditingRecord(null)
        setNewRecord({
          patientId: '',
          chiefComplaint: '',
          diagnosis: '',
          treatment: '',
          notes: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: '',
          labResults: '',
          prescriptions: '',
        })
        fetchRecords()
        alert('Medical record updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update medical record')
      }
    } catch (error) {
      console.error('Error updating medical record:', error)
      alert('Failed to update medical record')
    }
  }

  const generateReport = async (recordId: string) => {
    setGeneratingReport(recordId)
    try {
      const response = await fetch(`/api/medical-records/${recordId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `medical-report-${recordId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGeneratingReport(null)
    }
  }

  const shareWithPatient = async (record: MedicalRecord) => {
    try {
      const response = await fetch(`/api/medical-records/${record.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientEmail: record.patient.user.email,
          message: 'Your latest medical record has been shared with you.',
        }),
      })

      if (response.ok) {
        alert(`Medical record shared successfully with ${record.patient.user.firstName} ${record.patient.user.lastName}!`)
        setShowShareDialog(false)
        setShareRecord(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to share medical record')
      }
    } catch (error) {
      console.error('Error sharing medical record:', error)
      alert('Failed to share medical record')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-700 rounded-full animate-spin border-t-emerald-600 dark:border-t-emerald-400"></div>
            <div className="absolute inset-0 w-16 h-16 m-2 border-4 border-teal-200 dark:border-teal-700 rounded-full animate-spin border-t-teal-600 dark:border-t-teal-400" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-6 h-6 text-emerald-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-white via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-emerald-900/30 dark:to-teal-900/30 shadow-lg border border-emerald-100 dark:border-emerald-800">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center">
              <svg className="w-10 h-10 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Electronic Health Records
            </h1>
            <p className="text-emerald-600 dark:text-emerald-300 mt-2 font-medium text-lg">
              Comprehensive patient records and medical history management
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-64 border-2 border-emerald-200 focus:border-emerald-400">
                <SelectValue placeholder="Filter by patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowNewRecord(true)}
              className="clinic-gradient text-white shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Record
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-700">
            <TabsTrigger value="records" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Patient Records
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Clinical Analytics
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records">
            <Card className="card-colorful border-2 border-emerald-200 dark:border-emerald-700">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg">
                <CardTitle className="text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                  <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-2h6a2 2 0 011 2v2M7 7h10" />
                  </svg>
                  Medical Records
                </CardTitle>
                <CardDescription className="text-emerald-600 dark:text-emerald-300">
                  Patient medical history with AI-powered readmission risk analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No medical records found. Create the first record to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <Card key={record.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {record.patient.user.firstName} {record.patient.user.lastName}
                              </CardTitle>
                              <CardDescription>
                                {formatSimpleProviderName(record.provider.user.firstName, record.provider.user.lastName)} • {new Date(record.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              {getRiskBadge(record.readmissionRisk)}
                              <Badge variant="outline">
                                {record.appointment ? 'Appointment Visit' : 'Manual Entry'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Chief Complaint & Diagnosis */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {record.chiefComplaint && (
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-1">Chief Complaint</h4>
                                <p className="text-sm">{record.chiefComplaint}</p>
                              </div>
                            )}
                            {record.diagnosis && (
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-1">Diagnosis</h4>
                                <p className="text-sm">{record.diagnosis}</p>
                              </div>
                            )}
                          </div>

                          {/* Vitals */}
                          {formatVitals(record) && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Vital Signs</h4>
                              <p className="text-sm bg-gray-50 p-2 rounded">{formatVitals(record)}</p>
                            </div>
                          )}

                          {/* Treatment */}
                          {record.treatment && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Treatment</h4>
                              <p className="text-sm">{record.treatment}</p>
                            </div>
                          )}

                          {/* Prescriptions */}
                          {record.prescriptions && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Prescriptions</h4>
                              <p className="text-sm bg-blue-50 p-2 rounded">{record.prescriptions}</p>
                            </div>
                          )}

                          {/* Lab Results */}
                          {record.labResults && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Lab Results</h4>
                              <p className="text-sm bg-green-50 p-2 rounded">{record.labResults}</p>
                            </div>
                          )}

                          {/* Notes */}
                          {record.notes && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Clinical Notes</h4>
                              <p className="text-sm">{record.notes}</p>
                            </div>
                          )}

                          {/* AI Suggested Codes */}
                          {record.suggestedCodes && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">AI Suggested Codes</h4>
                              <p className="text-sm bg-purple-50 p-2 rounded">{record.suggestedCodes}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex space-x-2 pt-2 border-t">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditRecord(record)}
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Record
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generateReport(record.id)}
                              disabled={generatingReport === record.id}
                              className="hover:bg-green-50 hover:border-green-300"
                            >
                              {generatingReport === record.id ? (
                                <div className="w-4 h-4 mr-1 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                              Generate Report
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setShareRecord(record)
                                setShowShareDialog(true)
                              }}
                              className="hover:bg-purple-50 hover:border-purple-300"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                              Share with Patient
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Analytics</CardTitle>
                <CardDescription>
                  AI-powered insights and population health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">High-Risk Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {records.filter(r => r.readmissionRisk >= 0.7).length}
                      </div>
                      <p className="text-xs text-gray-500">Requiring immediate attention</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Average Readmission Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {records.length > 0 
                          ? Math.round((records.reduce((acc, r) => acc + r.readmissionRisk, 0) / records.length) * 100)
                          : 0}%
                      </div>
                      <p className="text-xs text-gray-500">Across all patients</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {records.length}
                      </div>
                      <p className="text-xs text-gray-500">Medical records managed</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-4">AI Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-medium text-yellow-800">Population Health Alert</p>
                      <p className="text-sm text-yellow-700">
                        {records.filter(r => r.readmissionRisk >= 0.7).length} patients show high readmission risk. Consider preventive care interventions.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-medium text-blue-800">Coding Optimization</p>
                      <p className="text-sm text-blue-700">
                        AI has suggested improved ICD-10 codes for {Math.floor(records.length * 0.3)} recent records to optimize billing accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Record Templates</CardTitle>
                <CardDescription>
                  Standardized templates for common conditions and procedures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Annual Physical', description: 'Comprehensive yearly examination template' },
                    { name: 'Acute Care Visit', description: 'Template for urgent care encounters' },
                    { name: 'Follow-up Visit', description: 'Standard follow-up appointment template' },
                    { name: 'Chronic Disease Management', description: 'Template for ongoing condition monitoring' },
                    { name: 'Preventive Care', description: 'Screening and prevention focused template' },
                    { name: 'Specialist Consultation', description: 'Referral and consultation template' },
                  ].map((template, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-500 mb-3">{template.description}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New/Edit Record Modal */}
        {(showNewRecord || editingRecord) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingRecord ? 'Edit Medical Record' : 'Create Medical Record'}</CardTitle>
                <CardDescription>
                  {editingRecord ? 'Update patient encounter details' : 'Document patient encounter with AI-powered risk assessment'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingRecord ? updateRecord : createRecord} className="space-y-6">
                  {/* Patient Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient</Label>
                    <Select
                      value={newRecord.patientId}
                      onValueChange={(value) =>
                        setNewRecord({ ...newRecord, patientId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chief Complaint and Diagnosis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                      <Textarea
                        id="chiefComplaint"
                        placeholder="Patient's primary concern or reason for visit"
                        value={newRecord.chiefComplaint}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, chiefComplaint: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        placeholder="Clinical diagnosis and assessment"
                        value={newRecord.diagnosis}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, diagnosis: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Vital Signs */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Vital Signs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bloodPressureSystolic">BP Systolic</Label>
                        <Input
                          id="bloodPressureSystolic"
                          type="number"
                          placeholder="120"
                          value={newRecord.bloodPressureSystolic}
                          onChange={(e) =>
                            setNewRecord({ ...newRecord, bloodPressureSystolic: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bloodPressureDiastolic">BP Diastolic</Label>
                        <Input
                          id="bloodPressureDiastolic"
                          type="number"
                          placeholder="80"
                          value={newRecord.bloodPressureDiastolic}
                          onChange={(e) =>
                            setNewRecord({ ...newRecord, bloodPressureDiastolic: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="heartRate">Heart Rate</Label>
                        <Input
                          id="heartRate"
                          type="number"
                          placeholder="72"
                          value={newRecord.heartRate}
                          onChange={(e) =>
                            setNewRecord({ ...newRecord, heartRate: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature (°F)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          placeholder="98.6"
                          value={newRecord.temperature}
                          onChange={(e) =>
                            setNewRecord({ ...newRecord, temperature: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="150"
                          value={newRecord.weight}
                          onChange={(e) =>
                            setNewRecord({ ...newRecord, weight: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Height (inches)</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.1"
                          placeholder="68"
                          value={newRecord.height}
                          onChange={(e) =>
                            setNewRecord({ ...newRecord, height: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Treatment and Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="treatment">Treatment Plan</Label>
                      <Textarea
                        id="treatment"
                        placeholder="Treatment recommendations and plan"
                        value={newRecord.treatment}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, treatment: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Clinical Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional clinical observations and notes"
                        value={newRecord.notes}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Lab Results and Prescriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="labResults">Lab Results</Label>
                      <Textarea
                        id="labResults"
                        placeholder="Laboratory test results and values"
                        value={newRecord.labResults}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, labResults: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prescriptions">Prescriptions</Label>
                      <Textarea
                        id="prescriptions"
                        placeholder="Medications prescribed and dosage instructions"
                        value={newRecord.prescriptions}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, prescriptions: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="clinic-gradient text-white flex-1">
                      {editingRecord ? 'Update Record' : 'Create Record'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewRecord(false)
                        setEditingRecord(null)
                        setNewRecord({
                          patientId: '',
                          chiefComplaint: '',
                          diagnosis: '',
                          treatment: '',
                          notes: '',
                          bloodPressureSystolic: '',
                          bloodPressureDiastolic: '',
                          heartRate: '',
                          temperature: '',
                          weight: '',
                          height: '',
                          labResults: '',
                          prescriptions: '',
                        })
                      }}
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

        {/* Share Dialog */}
        {showShareDialog && shareRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Medical Record
                </CardTitle>
                <CardDescription>
                  Share this medical record with the patient via secure email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
                  <p className="text-sm text-blue-700">
                    <strong>Name:</strong> {shareRecord.patient.user.firstName} {shareRecord.patient.user.lastName}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Email:</strong> {shareRecord.patient.user.email}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>Record Date:</strong> {new Date(shareRecord.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Important Notice</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        The patient will receive a secure link to view their medical record. 
                        The shared information will be accessible for 30 days.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => shareWithPatient(shareRecord)}
                    className="clinic-gradient text-white flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send to Patient
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowShareDialog(false)
                      setShareRecord(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}