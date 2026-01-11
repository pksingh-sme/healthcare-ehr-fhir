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
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'

interface PatientData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  dateOfBirth: string
}

interface ProviderData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  title: string
  specialty: string
  licenseNumber: string
  department: string
}

export default function RegisterPage() {
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: ''
  })

  const [providerData, setProviderData] = useState<ProviderData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    title: '',
    specialty: '',
    licenseNumber: '',
    department: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('patient')
  const { register, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromQuery = searchParams?.get('role')

  useEffect(() => {
    if (roleFromQuery) {
      setActiveTab(roleFromQuery)
    }
  }, [roleFromQuery])

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'PATIENT') {
        router.push('/patient')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, router])

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProviderData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (data: PatientData | ProviderData, isProvider: boolean) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }

    if (isProvider) {
      const provider = data as ProviderData
      if (!provider.licenseNumber || !provider.specialty) {
        setError('Please fill in all required provider fields')
        return false
      }
    }

    return true
  }

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(patientData, false)) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...patientData,
          role: 'PATIENT'
        }),
      })

      const data = await response.json()

      if (data.success) {
        register(data.data)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(providerData, true)) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...providerData,
          role: 'PROVIDER'
        }),
      })

      const data = await response.json()

      if (data.success) {
        register(data.data)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl card-colorful border-2 border-purple-200 dark:border-purple-700 shadow-2xl">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ClinicEase <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">AI</span>
            </h1>
          </div>
          <CardTitle className="text-2xl font-semibold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-center text-blue-600 dark:text-blue-300">
            Join our healthcare platform to get started with intelligent medical management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="provider">Healthcare Provider</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient">
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={patientData.firstName}
                      onChange={handlePatientChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={patientData.lastName}
                      onChange={handlePatientChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={patientData.email}
                    onChange={handlePatientChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={patientData.password}
                      onChange={handlePatientChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={patientData.confirmPassword}
                      onChange={handlePatientChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={patientData.phone}
                      onChange={handlePatientChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={patientData.dateOfBirth}
                      onChange={handlePatientChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full clinic-gradient text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Patient Account'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="provider">
              <form onSubmit={handleProviderSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={providerData.firstName}
                      onChange={handleProviderChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={providerData.lastName}
                      onChange={handleProviderChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={providerData.email}
                    onChange={handleProviderChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={providerData.password}
                      onChange={handleProviderChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={providerData.confirmPassword}
                      onChange={handleProviderChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Dr., NP, PA, etc."
                      value={providerData.title}
                      onChange={handleProviderChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      name="specialty"
                      placeholder="Internal Medicine, Cardiology, etc."
                      value={providerData.specialty}
                      onChange={handleProviderChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={providerData.licenseNumber}
                      onChange={handleProviderChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="Emergency, Surgery, etc."
                      value={providerData.department}
                      onChange={handleProviderChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full clinic-gradient text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Provider Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href={`/login${roleFromQuery ? `?role=${roleFromQuery}` : ''}`} 
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}