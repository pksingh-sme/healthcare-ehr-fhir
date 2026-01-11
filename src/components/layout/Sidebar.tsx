/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : Sidebar.tsx
 * Component/Class: Sidebar Component
 * Description    : Navigation sidebar component for application routing
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

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationCenter } from '@/components/realtime/NotificationCenter'
import { SettingsDropdown } from '@/components/ui/settings-dropdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  description?: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10z" />
      </svg>
    ),
  },
  {
    title: 'Patients',
    href: '/dashboard/patients',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Appointments',
    href: '/dashboard/appointments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'EHR',
    href: '/dashboard/ehr',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={cn('sidebar-colorful flex flex-col h-full border-r-4 border-gradient-to-b from-blue-400 via-purple-500 to-pink-500', className)}>
      {/* Logo */}
      <div className="p-6 border-b-2 border-gradient-to-r from-blue-400 to-purple-500 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">ClinicEase</h2>
            <p className="text-xs bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">AI</p>
          </div>
        </Link>
      </div>



      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems
          .filter(item => {
            // Show patients link only for admin users
            if (item.href === '/dashboard/patients') {
              return user?.role === 'ADMIN'
            }
            return true
          })
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white shadow-xl border-2 border-blue-300 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 dark:hover:from-blue-900/50 dark:hover:via-purple-900/50 dark:hover:to-pink-900/50 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-lg'
                )}
              >
                <div className={isActive ? 'text-white' : 'text-current'}>
                  {item.icon}
                </div>
                <span className="relative z-10">{item.title}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-xl animate-pulse"></div>
                )}
              </Link>
            )
          })}
      </nav>

      {/* User Info and Controls at Bottom */}
      <div className="mt-auto">
        {/* Provider Name */}
        <div className="p-4 border-t-2 border-gradient-to-r from-purple-300 via-pink-300 to-red-300 bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-red-900/40">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-12 h-12 border-2 border-purple-300 shadow-xl transform hover:scale-110 transition-all duration-300">
              <AvatarImage 
                src={user?.profileImage} 
                alt={`${user?.firstName} ${user?.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent truncate font-medium">
                {user?.role === 'PROVIDER' ? 'Healthcare Provider' : user?.role}
              </p>
            </div>
          </div>
          
          {/* Level 1: Primary Controls */}
          <div className="space-y-2">
            {/* Level 2: Notification & Settings */}
            <div className="flex items-center justify-between bg-white/30 dark:bg-gray-800/30 rounded-lg p-2 backdrop-blur-sm">
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Quick Actions</span>
              <div className="flex items-center space-x-2">
                {/* Level 3: Individual Controls */}
                <div className="flex items-center space-x-1">
                  {user?.role !== 'PROVIDER' && (
                    <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <ThemeToggle />
                    </div>
                  )}
                  <div className="p-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                    <NotificationCenter />
                  </div>
                  <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30">
                    <SettingsDropdown />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logout for non-providers */}
        {user?.role !== 'PROVIDER' && (
          <div className="p-4 border-t border-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 dark:from-red-900/30 dark:via-pink-900/30 dark:to-purple-900/30">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="logout-button w-full justify-start font-semibold text-base transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}