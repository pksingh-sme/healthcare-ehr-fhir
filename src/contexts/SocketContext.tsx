/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : SocketContext.tsx
 * Component/Class: SocketContext Context
 * Description    : WebSocket context for real-time communication and notifications
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
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/socket'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  receiverId: string
  timestamp: string
  isRead: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  timestamp: string
}

interface OnlineUser {
  id: string
  name: string
}

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  isConnected: boolean
  messages: Message[]
  notifications: Notification[]
  onlineUsers: OnlineUser[]
  unreadCount: number
  sendMessage: (receiverId: string, content: string) => void
  markMessageAsRead: (messageId: string) => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
  clearNotifications: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: React.ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  useEffect(() => {
    if (user && token) {
      console.log(`Initializing socket connection for user: ${user.firstName} ${user.lastName} (${user.role})`)
      
      // Cleanup any existing connection first
      if (socket) {
        console.log('Cleaning up existing socket connection')
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      
      const socketInstance = io('http://localhost:3001', {
        path: '/api/socket',
        addTrailingSlash: false,
        forceNew: false, // Don't force new connections unnecessarily
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 3,
        timeout: 10000, // Reduced timeout
        transports: ['polling'], // Use only polling to prevent websocket issues
        upgrade: false, // Prevent transport upgrades
        auth: {
          token: token,
        },
      })

      setSocket(socketInstance)

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.io server')
        console.log('Socket ID:', socketInstance.id)
        setIsConnected(true)
        
        // Add current user to online list immediately
        if (user) {
          const currentUser = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`
          }
          setOnlineUsers(prev => {
            const filtered = prev.filter(u => u.id !== user.id)
            return [...filtered, currentUser]
          })
        }
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.io server:', reason)
        console.log('Socket ID was:', socketInstance.id)
        setIsConnected(false)
        
        // Only clear online users if it's a permanent disconnect
        if (reason === 'io server disconnect' || reason === 'transport close') {
          console.log('Permanent disconnect detected, clearing online users')
          setOnlineUsers([])
        } else {
          console.log('Temporary disconnect, keeping online users list')
        }
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      socketInstance.on('newMessage', (message: Message) => {
        console.log('Received new message:', message)
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(msg => msg.id === message.id)
          if (exists) {
            console.log('Message already exists, skipping:', message.id)
            return prev
          }
          console.log('Adding new message to state:', message.id)
          return [...prev, message]
        })
      })

      socketInstance.on('notification', (notification: Notification) => {
        setNotifications(prev => [...prev, notification])
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          })
        }
      })

      socketInstance.on('appointmentUpdate', (appointment) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'Appointment Update',
          message: `${appointment.title} has been ${appointment.type}`,
          type: appointment.type === 'cancelled' ? 'warning' : 'info',
          userId: user.id,
          timestamp: new Date().toISOString(),
        }
        setNotifications(prev => [...prev, notification])
      })

      socketInstance.on('billingUpdate', (billing) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'Billing Update',
          message: `Payment of $${billing.amount} for ${billing.patientName} has been ${billing.status}`,
          type: billing.status === 'paid' ? 'success' : 'info',
          userId: user.id,
          timestamp: new Date().toISOString(),
        }
        setNotifications(prev => [...prev, notification])
      })

      socketInstance.on('userOnline', (user: OnlineUser) => {
        console.log('User came online:', user)
        setOnlineUsers(prev => {
          const filtered = prev.filter(u => u.id !== user.id)
          const updated = [...filtered, user]
          console.log('Updated online users:', updated.map(u => u.name))
          return updated
        })
      })

      socketInstance.on('userOffline', (user: OnlineUser) => {
        console.log('User went offline:', user)
        setOnlineUsers(prev => {
          const filtered = prev.filter(u => u.id !== user.id)
          console.log('Updated online users after removal:', filtered.map(u => u.name))
          return filtered
        })
      })

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [user, token])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { receiverId, content })
    }
  }

  const markMessageAsRead = (messageId: string) => {
    if (socket && isConnected) {
      socket.emit('markMessageRead', messageId)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      )
    }
  }

  const joinRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('join', room)
    }
  }

  const leaveRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('leave', room)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const unreadCount = messages.filter(msg => !msg.isRead && msg.receiverId === user?.id).length

  const value: SocketContextType = {
    socket,
    isConnected,
    messages,
    notifications,
    onlineUsers,
    unreadCount,
    sendMessage,
    markMessageAsRead,
    joinRoom,
    leaveRoom,
    clearNotifications,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}