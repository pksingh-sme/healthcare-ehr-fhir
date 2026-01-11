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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

interface AnalyticsData {
  revenue: {
    daily: Array<{ date: string; revenue: number; appointments: number }>
    monthly: Array<{ month: string; revenue: number; expenses: number; profit: number }>
  }
  appointments: {
    trends: Array<{ date: string; scheduled: number; completed: number; cancelled: number; noShows: number }>
    byType: Array<{ type: string; count: number; percentage: number }>
    noShowPredictions: Array<{ date: string; predicted: number; actual: number; accuracy: number }>
  }
  patients: {
    demographics: Array<{ ageGroup: string; count: number; percentage: number }>
    riskDistribution: Array<{ risk: string; count: number; color: string }>
    satisfaction: Array<{ period: string; score: number; responses: number }>
  }
  clinical: {
    commonDiagnoses: Array<{ diagnosis: string; count: number; trend: number }>
    readmissionRates: Array<{ month: string; rate: number; target: number }>
    vitalsTrends: Array<{ metric: string; average: number; trend: string }>
  }
  ai: {
    insights: Array<{ type: string; title: string; description: string; priority: string; action: string }>
    predictions: {
      staffingNeeds: string
      revenueProjection: number
      patientVolume: number
    }
  }
}

export default function AnalyticsPage() {
  const { user, token } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (token) {
      fetchAnalytics()
    }
  }, [token, timeRange])

  const fetchAnalytics = async () => {
    try {
      // In a real app, this would call the actual analytics API
      // For now, we'll generate mock data
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        revenue: {
          daily: generateDailyRevenue(),
          monthly: generateMonthlyRevenue(),
        },
        appointments: {
          trends: generateAppointmentTrends(),
          byType: [
            { type: 'Annual Checkup', count: 145, percentage: 35 },
            { type: 'Follow-up', count: 98, percentage: 24 },
            { type: 'Consultation', count: 76, percentage: 18 },
            { type: 'Procedure', count: 54, percentage: 13 },
            { type: 'Emergency', count: 41, percentage: 10 },
          ],
          noShowPredictions: generateNoShowPredictions(),
        },
        patients: {
          demographics: [
            { ageGroup: '0-18', count: 234, percentage: 18 },
            { ageGroup: '19-35', count: 345, percentage: 27 },
            { ageGroup: '36-50', count: 287, percentage: 22 },
            { ageGroup: '51-65', count: 298, percentage: 23 },
            { ageGroup: '65+', count: 136, percentage: 10 },
          ],
          riskDistribution: [
            { risk: 'Low Risk', count: 789, color: '#10B981' },
            { risk: 'Medium Risk', count: 234, color: '#F59E0B' },
            { risk: 'High Risk', count: 67, color: '#EF4444' },
          ],
          satisfaction: generateSatisfactionData(),
        },
        clinical: {
          commonDiagnoses: [
            { diagnosis: 'Hypertension', count: 156, trend: 5 },
            { diagnosis: 'Type 2 Diabetes', count: 134, trend: -2 },
            { diagnosis: 'Anxiety Disorders', count: 98, trend: 12 },
            { diagnosis: 'Chronic Pain', count: 87, trend: 3 },
            { diagnosis: 'Upper Respiratory Infection', count: 76, trend: -8 },
          ],
          readmissionRates: generateReadmissionRates(),
          vitalsTrends: [
            { metric: 'Average BP Systolic', average: 128, trend: 'stable' },
            { metric: 'Average Heart Rate', average: 72, trend: 'improving' },
            { metric: 'Average BMI', average: 26.4, trend: 'concerning' },
          ],
        },
        ai: {
          insights: [
            {
              type: 'staffing',
              title: 'Increased Patient Volume Detected',
              description: 'AI predicts 25% increase in appointments next week. Consider scheduling additional staff.',
              priority: 'high',
              action: 'Review staffing schedule',
            },
            {
              type: 'revenue',
              title: 'Billing Optimization Opportunity',
              description: 'AI identified $12,450 in potential additional revenue through improved coding accuracy.',
              priority: 'medium',
              action: 'Review suggested codes',
            },
            {
              type: 'clinical',
              title: 'Population Health Alert',
              description: 'Higher than normal prevalence of anxiety disorders. Consider preventive mental health programs.',
              priority: 'medium',
              action: 'Develop intervention strategy',
            },
          ],
          predictions: {
            staffingNeeds: 'Need 2 additional nurses next week',
            revenueProjection: 158750,
            patientVolume: 1247,
          },
        },
      }

      setAnalytics(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateDailyRevenue = () => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 5000) + 2000,
        appointments: Math.floor(Math.random() * 25) + 15,
      })
    }
    return data
  }

  const generateMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 80000,
      expenses: Math.floor(Math.random() * 30000) + 40000,
      profit: Math.floor(Math.random() * 25000) + 35000,
    }))
  }

  const generateAppointmentTrends = () => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const scheduled = Math.floor(Math.random() * 30) + 20
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scheduled,
        completed: Math.floor(scheduled * 0.85) + Math.floor(Math.random() * 5),
        cancelled: Math.floor(scheduled * 0.1) + Math.floor(Math.random() * 3),
        noShows: Math.floor(scheduled * 0.05) + Math.floor(Math.random() * 2),
      })
    }
    return data
  }

  const generateNoShowPredictions = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const predicted = Math.floor(Math.random() * 8) + 2
      const actual = predicted + Math.floor(Math.random() * 3) - 1
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        predicted,
        actual: Math.max(0, actual),
        accuracy: Math.floor((1 - Math.abs(predicted - actual) / predicted) * 100),
      })
    }
    return data
  }

  const generateSatisfactionData = () => {
    const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return periods.map(period => ({
      period,
      score: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      responses: Math.floor(Math.random() * 50) + 150,
    }))
  }

  const generateReadmissionRates = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      rate: Math.round((Math.random() * 3 + 2) * 10) / 10,
      target: 4.0,
    }))
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              AI-powered insights and comprehensive clinic analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="clinic-gradient text-white">
              Export Report
            </Button>
          </div>
        </div>

        {/* AI Insights Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Real-time analysis and recommendations from your clinic data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics?.ai.insights.map((insight, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <Button size="sm" variant="outline">
                    {insight.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Analytics */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="clinical">Clinical</TabsTrigger>
          </TabsList>

          {/* Revenue Analytics */}
          <TabsContent value="revenue">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue Trends</CardTitle>
                  <CardDescription>Revenue and appointment volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.revenue.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                        name="Revenue ($)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Profit Analysis</CardTitle>
                  <CardDescription>Revenue, expenses, and profit breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Analytics */}
          <TabsContent value="appointments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>Daily appointment completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.appointments.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="scheduled" stroke="#3B82F6" name="Scheduled" />
                      <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
                      <Line type="monotone" dataKey="cancelled" stroke="#F59E0B" name="Cancelled" />
                      <Line type="monotone" dataKey="noShows" stroke="#EF4444" name="No Shows" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointments by Type</CardTitle>
                  <CardDescription>Distribution of appointment categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.appointments.byType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics?.appointments.byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>AI No-Show Predictions vs Actual</CardTitle>
                  <CardDescription>Machine learning accuracy for appointment no-shows</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.appointments.noShowPredictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="predicted" fill="#3B82F6" name="AI Predicted" />
                      <Bar dataKey="actual" fill="#10B981" name="Actual No-Shows" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patient Analytics */}
          <TabsContent value="patients">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Demographics</CardTitle>
                  <CardDescription>Age distribution of patient population</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.patients.demographics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ageGroup" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Patient readmission risk categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.patients.riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ risk, count }) => `${risk}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics?.patients.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Patient Satisfaction Trends</CardTitle>
                  <CardDescription>Average satisfaction scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.patients.satisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="Satisfaction Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clinical Analytics */}
          <TabsContent value="clinical">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Common Diagnoses</CardTitle>
                  <CardDescription>Most frequent conditions and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.clinical.commonDiagnoses.map((diagnosis, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{diagnosis.diagnosis}</p>
                          <p className="text-sm text-gray-500">{diagnosis.count} cases</p>
                        </div>
                        <Badge variant={diagnosis.trend > 0 ? 'destructive' : 'secondary'}>
                          {diagnosis.trend > 0 ? '+' : ''}{diagnosis.trend}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Readmission Rates</CardTitle>
                  <CardDescription>Monthly readmission rates vs target</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.clinical.readmissionRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rate" stroke="#EF4444" name="Actual Rate %" />
                      <Line type="monotone" dataKey="target" stroke="#10B981" strokeDasharray="5 5" name="Target %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Population Health Metrics</CardTitle>
                  <CardDescription>Average vital signs and health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics?.clinical.vitalsTrends.map((vital, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">{vital.metric}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-2xl font-bold">{vital.average}</span>
                          <Badge variant={vital.trend === 'improving' ? 'secondary' : vital.trend === 'concerning' ? 'destructive' : 'outline'}>
                            {vital.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}