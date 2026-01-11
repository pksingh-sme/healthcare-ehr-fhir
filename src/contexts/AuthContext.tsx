/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : AuthContext.tsx
 * Component/Class: AuthContext Context
 * Description    : Authentication context for user session and permission management
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

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Role } from '@prisma/client'

interface Patient {
  id: string
  userId: string
  dateOfBirth?: Date
  emergencyContact?: string
  insurance?: string
}

interface Provider {
  id: string
  userId: string
  licenseNumber?: string
  specialty?: string
  department?: string
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  profileImage?: string
  twoFAEnabled: boolean
  patient?: Patient
  provider?: Provider
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  dateOfBirth?: string
  licenseNumber?: string
  specialty?: string
  emergencyContact?: string
  insurance?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, twoFAToken?: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      fetchUser(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result.data)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, twoFAToken?: string): Promise<boolean> => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, twoFAToken }),
      })

      const result = await response.json()

      if (response.ok) {
        const { user: userData, token: authToken } = result.data
        setUser(userData)
        setToken(authToken)
        localStorage.setItem('token', authToken)
        return true
      } else {
        setError(result.error || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        const { user: userData, token: authToken } = result.data
        setUser(userData)
        setToken(authToken)
        localStorage.setItem('token', authToken)
        return true
      } else {
        setError(result.error || 'Registration failed')
        return false
      }
    } catch (error) {
      setError('Network error. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      
      // Redirect to login page after logout
      window.location.href = '/login'
    }
  }

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token)
    }
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    loading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}