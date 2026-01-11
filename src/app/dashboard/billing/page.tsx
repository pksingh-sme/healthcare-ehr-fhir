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

interface BillingRecord {
  id: string
  invoiceNumber: string
  serviceDate: string
  serviceDescription: string
  subtotal: number
  tax: number
  total: number
  status: string
  paidAmount: number
  patientResponsibility: number
  insuranceBilled: number
  paymentMethod?: string
  paymentDate?: string
  icdCodes?: string
  cptCodes?: string
  patient: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  appointment?: {
    title: string
    startTime: string
    provider?: {
      user: {
        firstName: string
        lastName: string
      }
    }
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

interface BillingStats {
  totalRevenue: number
  pendingAmount: number
  paidAmount: number
  overdueAmount: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
}

export default function BillingPage() {
  const { user, token } = useAuth()
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showNewInvoice, setShowNewInvoice] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentRecord, setPaymentRecord] = useState<BillingRecord | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    notes: '',
  })
  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    serviceDescription: '',
    subtotal: '',
    tax: '',
    icdCodes: '',
    cptCodes: '',
  })

  useEffect(() => {
    if (token) {
      fetchBillingData()
      fetchPatients()
    }
  }, [token])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBillingRecords(data.data || [])
        calculateStats(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
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

  const calculateStats = (records: BillingRecord[]) => {
    const stats = records.reduce((acc, record) => {
      acc.totalRevenue += record.total
      acc.totalInvoices += 1

      if (record.status === 'PAID') {
        acc.paidAmount += record.total
        acc.paidInvoices += 1
      } else if (record.status === 'PENDING') {
        acc.pendingAmount += record.total - record.paidAmount
        acc.pendingInvoices += 1
      } else if (record.status === 'OVERDUE') {
        acc.overdueAmount += record.total - record.paidAmount
        acc.overdueInvoices += 1
      }

      return acc
    }, {
      totalRevenue: 0,
      pendingAmount: 0,
      paidAmount: 0,
      overdueAmount: 0,
      totalInvoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
    })

    setStats(stats)
  }

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: newInvoice.patientId,
          serviceDescription: newInvoice.serviceDescription,
          subtotal: parseFloat(newInvoice.subtotal),
          tax: parseFloat(newInvoice.tax || '0'),
          icdCodes: newInvoice.icdCodes.split(',').map(code => code.trim()).filter(Boolean),
          cptCodes: newInvoice.cptCodes.split(',').map(code => code.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        setShowNewInvoice(false)
        setNewInvoice({
          patientId: '',
          serviceDescription: '',
          subtotal: '',
          tax: '',
          icdCodes: '',
          cptCodes: '',
        })
        fetchBillingData()
        alert('Invoice created successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      PAID: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' },
      OVERDUE: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Overdue' },
      PARTIAL: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Partial' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentProgress = (record: BillingRecord) => {
    const percentage = (record.paidAmount / record.total) * 100
    return Math.min(percentage, 100)
  }

  const handleViewRecord = (record: BillingRecord) => {
    setSelectedRecord(record)
    setShowViewModal(true)
  }

  const handleProcessPayment = (record: BillingRecord) => {
    setPaymentRecord(record)
    setPaymentData({
      amount: (record.total - record.paidAmount).toFixed(2),
      paymentMethod: '',
      notes: '',
    })
    setShowPaymentModal(true)
  }

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentRecord) return

    setProcessingPayment(true)
    try {
      const response = await fetch(`/api/billing/${paymentRecord.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes,
        }),
      })

      if (response.ok) {
        setShowPaymentModal(false)
        setPaymentRecord(null)
        setPaymentData({ amount: '', paymentMethod: '', notes: '' })
        fetchBillingData()
        alert('Payment processed successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to process payment')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Failed to process payment')
    } finally {
      setProcessingPayment(false)
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
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-white via-green-50 to-emerald-50 dark:from-gray-800 dark:via-green-900/30 dark:to-emerald-900/30 shadow-lg border border-green-100 dark:border-green-800">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent flex items-center">
              <svg className="w-10 h-10 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Billing & Revenue
            </h1>
            <p className="text-green-600 dark:text-green-300 mt-2 font-medium text-lg">
              Manage invoices, payments, and financial operations
            </p>
          </div>
          <Button
            onClick={() => setShowNewInvoice(true)}
            className="clinic-gradient text-white shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-colorful border-2 border-green-200 dark:border-green-700 transform hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg">
              <CardTitle className="text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Total Revenue</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {stats.totalInvoices} total invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats.paidAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {stats.paidInvoices} paid invoices
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.paidAmount / stats.totalRevenue) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ${stats.pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {stats.pendingInvoices} pending invoices
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.pendingAmount / stats.totalRevenue) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${stats.overdueAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {stats.overdueInvoices} overdue invoices
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.overdueAmount / stats.totalRevenue) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList>
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending Payments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>
                  View and manage all billing records with beautiful visual progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No billing records found. Create your first invoice to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {record.patient.user.firstName} {record.patient.user.lastName}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.serviceDescription}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">${record.total.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                Paid: ${record.paidAmount.toFixed(2)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{getPaymentProgress(record).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    record.status === 'PAID' ? 'bg-green-500' :
                                    record.status === 'OVERDUE' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                  }`}
                                  style={{ width: `${getPaymentProgress(record)}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewRecord(record)}
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </Button>
                              {record.status !== 'PAID' && (
                                <Button 
                                  size="sm" 
                                  className="clinic-gradient text-white hover:scale-105 transition-transform"
                                  onClick={() => handleProcessPayment(record)}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  Process Payment
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>
                  Invoices requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingRecords
                    .filter(record => record.status === 'PENDING' || record.status === 'OVERDUE')
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {record.patient.user.firstName} {record.patient.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.invoiceNumber} • {record.serviceDescription}
                          </div>
                          <div className="text-sm text-gray-500">
                            Service Date: {new Date(record.serviceDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="font-medium">${record.total.toFixed(2)}</div>
                          {getStatusBadge(record.status)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Revenue analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Advanced reporting dashboard coming soon</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Revenue trends, payment analytics, and AI-powered insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Invoice Modal */}
        {showNewInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
                <CardDescription>
                  Generate a new billing invoice with AI-assisted coding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createInvoice} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Patient</Label>
                      <Select
                        value={newInvoice.patientId}
                        onValueChange={(value) =>
                          setNewInvoice({ ...newInvoice, patientId: value })
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

                    <div className="space-y-2">
                      <Label htmlFor="subtotal">Subtotal ($)</Label>
                      <Input
                        id="subtotal"
                        type="number"
                        step="0.01"
                        value={newInvoice.subtotal}
                        onChange={(e) =>
                          setNewInvoice({ ...newInvoice, subtotal: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax">Tax ($)</Label>
                      <Input
                        id="tax"
                        type="number"
                        step="0.01"
                        value={newInvoice.tax}
                        onChange={(e) =>
                          setNewInvoice({ ...newInvoice, tax: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total</Label>
                      <div className="text-lg font-medium p-2 bg-gray-50 rounded">
                        ${((parseFloat(newInvoice.subtotal) || 0) + (parseFloat(newInvoice.tax) || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceDescription">Service Description</Label>
                    <Textarea
                      id="serviceDescription"
                      placeholder="Describe the service provided..."
                      value={newInvoice.serviceDescription}
                      onChange={(e) =>
                        setNewInvoice({ ...newInvoice, serviceDescription: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icdCodes">ICD-10 Codes</Label>
                      <Input
                        id="icdCodes"
                        placeholder="e.g., J09.X2, M79.3"
                        value={newInvoice.icdCodes}
                        onChange={(e) =>
                          setNewInvoice({ ...newInvoice, icdCodes: e.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        AI will suggest codes based on service description
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cptCodes">CPT Codes</Label>
                      <Input
                        id="cptCodes"
                        placeholder="e.g., 99213, 99214"
                        value={newInvoice.cptCodes}
                        onChange={(e) =>
                          setNewInvoice({ ...newInvoice, cptCodes: e.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Procedure codes for billing
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="clinic-gradient text-white flex-1">
                      Create Invoice
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewInvoice(false)}
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

        {/* View Record Modal */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardTitle className="flex items-center text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Invoice Details - {selectedRecord.invoiceNumber}
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300">
                  Complete billing information and payment history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Patient & Service Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-blue-600">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span>{selectedRecord.patient.user.firstName} {selectedRecord.patient.user.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="text-blue-600">{selectedRecord.patient.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Service Date:</span>
                        <span>{new Date(selectedRecord.serviceDate).toLocaleDateString()}</span>
                      </div>
                      {selectedRecord.appointment && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Appointment:</span>
                            <span>{selectedRecord.appointment.title}</span>
                          </div>
                          {selectedRecord.appointment.provider && (
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Provider:</span>
                              <span>Dr. {selectedRecord.appointment.provider.user.firstName} {selectedRecord.appointment.provider.user.lastName}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-green-600">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Subtotal:</span>
                        <span>${selectedRecord.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Tax:</span>
                        <span>${selectedRecord.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-green-600">${selectedRecord.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Paid Amount:</span>
                        <span className="text-green-600">${selectedRecord.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Remaining Balance:</span>
                        <span className={`font-bold ${
                          selectedRecord.total - selectedRecord.paidAmount === 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${(selectedRecord.total - selectedRecord.paidAmount).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Payment Progress</span>
                          <span>{getPaymentProgress(selectedRecord).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${getPaymentProgress(selectedRecord)}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Service Details */}
                <Card className="border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-600">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="mt-1 text-gray-800">{selectedRecord.serviceDescription}</p>
                      </div>
                      {selectedRecord.icdCodes && (
                        <div>
                          <span className="font-medium text-gray-600">ICD-10 Codes:</span>
                          <p className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">{selectedRecord.icdCodes}</p>
                        </div>
                      )}
                      {selectedRecord.cptCodes && (
                        <div>
                          <span className="font-medium text-gray-600">CPT Codes:</span>
                          <p className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">{selectedRecord.cptCodes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-indigo-600">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{getStatusBadge(selectedRecord.status)}</div>
                        <div className="text-sm text-gray-500 mt-1">Current Status</div>
                      </div>
                      {selectedRecord.paymentMethod && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-600">{selectedRecord.paymentMethod}</div>
                          <div className="text-sm text-gray-500 mt-1">Payment Method</div>
                        </div>
                      )}
                      {selectedRecord.paymentDate && (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-600">
                            {new Date(selectedRecord.paymentDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Last Payment</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  {selectedRecord.status !== 'PAID' && (
                    <Button
                      onClick={() => {
                        setShowViewModal(false)
                        handleProcessPayment(selectedRecord)
                      }}
                      className="clinic-gradient text-white flex-1"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Process Payment
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Invoice
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedRecord(null)
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Process Payment Modal */}
        {showPaymentModal && paymentRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl m-4">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardTitle className="flex items-center text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Process Payment - {paymentRecord.invoiceNumber}
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300">
                  Record payment for {paymentRecord.patient.user.firstName} {paymentRecord.patient.user.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Summary */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Invoice Total:</span>
                        <div className="text-lg font-bold text-gray-800">${paymentRecord.total.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Amount Paid:</span>
                        <div className="text-lg font-bold text-green-600">${paymentRecord.paidAmount.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Outstanding Balance:</span>
                        <div className="text-xl font-bold text-red-600">
                          ${(paymentRecord.total - paymentRecord.paidAmount).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Payment Progress:</span>
                        <div className="mt-1">
                          <div className="text-sm text-gray-600">{getPaymentProgress(paymentRecord).toFixed(0)}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getPaymentProgress(paymentRecord)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Form */}
                <form onSubmit={submitPayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                      <Input
                        id="paymentAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={paymentRecord.total - paymentRecord.paidAmount}
                        value={paymentData.amount}
                        onChange={(e) =>
                          setPaymentData({ ...paymentData, amount: e.target.value })
                        }
                        required
                        className="text-lg font-semibold"
                      />
                      <p className="text-xs text-gray-500">
                        Maximum: ${(paymentRecord.total - paymentRecord.paidAmount).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={paymentData.paymentMethod}
                        onValueChange={(value) =>
                          setPaymentData({ ...paymentData, paymentMethod: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Debit Card">Debit Card</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">Payment Notes (Optional)</Label>
                    <Textarea
                      id="paymentNotes"
                      placeholder="Add any additional notes about this payment..."
                      value={paymentData.notes}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, notes: e.target.value })
                      }
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Payment Preview */}
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium text-green-800 mb-2">Payment Preview</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Payment Amount:</span>
                          <span className="font-semibold">${parseFloat(paymentData.amount || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Balance:</span>
                          <span className="font-semibold">
                            ${(paymentRecord.total - paymentRecord.paidAmount - parseFloat(paymentData.amount || '0')).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Status:</span>
                          <span className="font-semibold">
                            {(paymentRecord.total - paymentRecord.paidAmount - parseFloat(paymentData.amount || '0')) <= 0.01 
                              ? 'PAID' 
                              : 'PARTIAL'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Progress:</span>
                          <span className="font-semibold">
                            {Math.min(((paymentRecord.paidAmount + parseFloat(paymentData.amount || '0')) / paymentRecord.total) * 100, 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={processingPayment || !paymentData.amount || !paymentData.paymentMethod}
                      className="clinic-gradient text-white flex-1"
                    >
                      {processingPayment ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Process Payment
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPaymentModal(false)
                        setPaymentRecord(null)
                        setPaymentData({ amount: '', paymentMethod: '', notes: '' })
                      }}
                      disabled={processingPayment}
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