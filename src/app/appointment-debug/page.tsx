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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function AppointmentDebugPage() {
  const { user, token } = useAuth()
  const [providers, setProviders] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const fetchData = async () => {
    setLogs([])
    setError(null)
    
    try {
      addLog('🔍 Starting data fetch process...')
      addLog(`👤 Current user: ${user?.firstName} ${user?.lastName} (${user?.role})`)
      addLog(`🔑 Token available: ${!!token}`)

      // Test providers fetch
      addLog('📡 Fetching providers...')
      const providersResponse = await fetch('/api/users?role=PROVIDER', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      addLog(`📊 Providers response status: ${providersResponse.status}`)
      
      if (providersResponse.ok) {
        const providersData = await providersResponse.json()
        addLog(`✅ Providers data received: ${JSON.stringify(providersData, null, 2)}`)
        setProviders(providersData.data || [])
      } else {
        const errorData = await providersResponse.json()
        addLog(`❌ Providers fetch failed: ${JSON.stringify(errorData)}`)
        setError(`Failed to fetch providers: ${errorData.error}`)
      }

      // Test patients fetch
      addLog('📡 Fetching patients...')
      const patientsResponse = await fetch('/api/users?role=PATIENT', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      addLog(`📊 Patients response status: ${patientsResponse.status}`)
      
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json()
        addLog(`✅ Patients data received: ${JSON.stringify(patientsData, null, 2)}`)
        setPatients(patientsData.data || [])
      } else {
        const errorData = await patientsResponse.json()
        addLog(`❌ Patients fetch failed: ${JSON.stringify(errorData)}`)
        setError(`Failed to fetch patients: ${errorData.error}`)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addLog(`💥 Error occurred: ${errorMessage}`)
      setError(errorMessage)
    }
  }

  const testAppointmentCreation = async () => {
    if (providers.length === 0 || patients.length === 0) {
      addLog('❌ Cannot test appointment creation - no providers or patients available')
      return
    }

    const testData = {
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow
      duration: 30,
      type: 'consultation',
      notes: 'Test appointment',
      patientId: patients[0].patient?.id || patients[0].id,
      providerId: providers[0].provider?.id || providers[0].id,
    }

    addLog(`🧪 Testing appointment creation with data: ${JSON.stringify(testData, null, 2)}`)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
      })

      addLog(`📊 Appointment creation response status: ${response.status}`)
      
      const responseData = await response.json()
      addLog(`📦 Appointment creation response: ${JSON.stringify(responseData, null, 2)}`)

      if (response.ok) {
        addLog(`✅ Appointment created successfully!`)
      } else {
        addLog(`❌ Appointment creation failed: ${responseData.error}`)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addLog(`💥 Appointment creation error: ${errorMessage}`)
    }
  }

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Please log in to view this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-blue-900/30 dark:to-purple-900/30 shadow-lg border border-blue-100 dark:border-blue-800 rounded-xl p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Appointment Creation Debug
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Debug and troubleshoot appointment creation issues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">
                Test Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={fetchData}
                variant="outline"
                className="w-full"
              >
                🔄 Refresh Data
              </Button>
              
              <Button
                onClick={testAppointmentCreation}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                disabled={providers.length === 0 || patients.length === 0}
              >
                🧪 Test Appointment Creation
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                Debug Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No logs yet. Click "Refresh Data" to start debugging.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Providers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600 dark:text-purple-400">
                Providers ({providers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {providers.length === 0 ? (
                  <p className="text-gray-500">No providers found</p>
                ) : (
                  providers.map((provider, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <p className="font-semibold">{provider.firstName} {provider.lastName}</p>
                      <p className="text-sm text-gray-600">Email: {provider.email}</p>
                      <p className="text-sm text-gray-600">User ID: {provider.id}</p>
                      {provider.provider && (
                        <>
                          <p className="text-sm text-gray-600">Provider ID: {provider.provider.id}</p>
                          <p className="text-sm text-gray-600">Specialty: {provider.provider.specialty}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400">
                Patients ({patients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {patients.length === 0 ? (
                  <p className="text-gray-500">No patients found</p>
                ) : (
                  patients.map((patient, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-600">Email: {patient.email}</p>
                      <p className="text-sm text-gray-600">User ID: {patient.id}</p>
                      {patient.patient && (
                        <p className="text-sm text-gray-600">Patient ID: {patient.patient.id}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}