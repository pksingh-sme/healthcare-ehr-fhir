/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : NotificationCenter.tsx
 * Component/Class: NotificationCenter Component
 * Description    : Notification center for alerts and system messages
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
import { Bell, X, MessageCircle, Calendar, CreditCard, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSocket } from '@/contexts/SocketContext'
import { cn } from '@/lib/utils'

export function NotificationCenter() {
  const { notifications, unreadCount, clearNotifications, isConnected } = useSocket()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'appointment': return <Calendar className="w-4 h-4" />
      case 'billing': return <CreditCard className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-6 w-6 p-0 hover:bg-gradient-to-r hover:from-yellow-200 hover:to-orange-200 dark:hover:from-yellow-800 dark:hover:to-orange-800 transition-all duration-300 rounded-md"
        >
          <Bell className="h-3 w-3" />
          {(notifications.length > 0 || unreadCount > 0) && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center p-0 text-[8px] leading-none"
            >
              {notifications.length + unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm">🔔 Notifications</h3>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && unreadCount === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Real-time notifications */}
              {notifications.map((notification) => (
                <Card key={notification.id} className="m-2 border-l-4 border-l-blue-500">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-1 rounded-full",
                        getNotificationColor(notification.type)
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Unread messages notification */}
              {unreadCount > 0 && (
                <Card className="m-2 border-l-4 border-l-green-500">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-1 rounded-full text-green-600 bg-green-50 border-green-200">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          New Messages
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {!isConnected && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Connection lost. Reconnecting...</span>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ConnectionStatus() {
  const { isConnected } = useSocket()

  if (isConnected) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Reconnecting to server...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}