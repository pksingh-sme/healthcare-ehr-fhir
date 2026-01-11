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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react'

interface Patient {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: string
  }
  dateOfBirth: string
  emergencyContact?: string
  insuranceType?: string
  insuranceProvider?: string
}

export default function PatientsPage() {
  const { user, token } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Filter only patients from the users data
          const patientsData = result.data.filter((item: any) => 
            item.user && item.user.role === 'PATIENT'
          )
          setPatients(patientsData)
        }
      } else {
        setError('Failed to fetch patients')
      }
    } catch (err) {
      setError('Error loading patients')
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-white via-teal-50 to-cyan-50 dark:from-gray-800 dark:via-teal-900/30 dark:to-cyan-900/30 shadow-lg border border-teal-100 dark:border-teal-800">
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center">
            <svg className="w-10 h-10 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Patients
          </h1>
          <p className="text-teal-600 dark:text-teal-300 mt-2 font-medium text-lg">Manage patient records and information</p>
        </div>
        <Button className="clinic-gradient text-white shadow-lg transform hover:scale-105 transition-all duration-300">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="card-colorful border-2 border-teal-200 dark:border-teal-700">
        <CardContent className="pt-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
              <Search className="text-white w-3 h-3" />
            </div>
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-2 border-teal-200 focus:border-teal-400 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="card-colorful border-2 border-teal-200 dark:border-teal-700">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-t-lg">
          <CardTitle className="text-xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center">
            <svg className="w-6 h-6 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Patient Records
          </CardTitle>
          <CardDescription className="text-teal-600 dark:text-teal-300">
            {loading ? 'Loading...' : `${filteredPatients.length} patients found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {patient.user.firstName} {patient.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {patient.user.email}
                          </div>
                          {patient.user.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {patient.user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {getAge(patient.dateOfBirth)} years
                          </div>
                          <div className="text-sm text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDate(patient.dateOfBirth)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Badge variant="outline" className="w-fit">
                            {patient.insuranceType || 'SELF_PAY'}
                          </Badge>
                          {patient.insuranceProvider && (
                            <div className="text-sm text-gray-500 mt-1">
                              {patient.insuranceProvider}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {patient.emergencyContact || 'Not provided'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FileText className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}