/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : socket.ts
 * Component/Class: socket Utility
 * Description    : WebSocket client configuration and real-time communication utilities
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

import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO, Socket } from 'socket.io'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: ServerIO
    }
  }
}

interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: string
}

// Socket.io event types
export interface ServerToClientEvents {
  newMessage: (message: {
    id: string
    content: string
    senderId: string
    senderName: string
    receiverId: string
    timestamp: string
    isRead: boolean
  }) => void
  
  appointmentUpdate: (appointment: {
    id: string
    title: string
    startTime: string
    status: string
    patientName: string
    providerName: string
    type: 'created' | 'updated' | 'cancelled'
  }) => void
  
  notification: (notification: {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    userId: string
    timestamp: string
  }) => void
  
  billingUpdate: (billing: {
    id: string
    patientName: string
    amount: number
    status: string
    type: 'payment' | 'overdue' | 'processed'
  }) => void
  
  userOnline: (user: { id: string; name: string }) => void
  userOffline: (user: { id: string; name: string }) => void
}

export interface ClientToServerEvents {
  join: (room: string) => void
  leave: (room: string) => void
  sendMessage: (data: {
    content: string
    receiverId: string
  }) => void
  markMessageRead: (messageId: string) => void
  typing: (data: { receiverId: string; isTyping: boolean }) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
  userRole: string
  userName: string
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
        methods: ['GET', 'POST'],
      },
    })
    
    res.socket.server.io = io

    // Authentication middleware
    io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error'))
        }

        const payload = verifyToken(token)
        if (!payload) {
          return next(new Error('Invalid token'))
        }

        // Get user info from database
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        })

        if (!user) {
          return next(new Error('User not found'))
        }

        socket.userId = user.id
        socket.userRole = user.role
        socket.userName = `${user.firstName} ${user.lastName}`
        
        next()
      } catch (error) {
        console.error('Socket authentication error:', error)
        next(new Error('Authentication error'))
      }
    })

    io.on('connection', (socket: any) => {
      console.log(`User ${socket.userName} (${socket.userId}) connected with socket ID: ${socket.id}`)

      // Join user to their personal room
      socket.join(`user_${socket.userId}`)
      console.log(`User ${socket.userName} joined room: user_${socket.userId}`)
      
      // Join user to role-based rooms
      if (socket.userRole === 'PROVIDER' || socket.userRole === 'ADMIN') {
        socket.join('staff')
        console.log(`User ${socket.userName} joined staff room`)
      }
      if (socket.userRole === 'PATIENT') {
        socket.join('patients')
        console.log(`User ${socket.userName} joined patients room`)
      }

      // Broadcast user online status to all connected clients (including self)
      const userOnlineData = {
        id: socket.userId,
        name: socket.userName,
      }
      
      // Emit to all clients including sender
      io.emit('userOnline', userOnlineData)
      console.log(`Broadcasted online status for ${socket.userName} to all clients`)

      // Handle joining specific rooms (e.g., appointment rooms)
      socket.on('join', (room: string) => {
        socket.join(room)
        console.log(`User ${socket.userName} joined room: ${room}`)
      })

      socket.on('leave', (room: string) => {
        socket.leave(room)
        console.log(`User ${socket.userName} left room: ${room}`)
      })

      // Handle sending messages
      socket.on('sendMessage', async (data: { content: string; receiverId: string }) => {
        try {
          console.log(`Sending message from ${socket.userName} (${socket.userId}) to user ${data.receiverId}`)
          
          // Get receiver info to determine if they are a patient
          const receiver = await prisma.user.findUnique({
            where: { id: data.receiverId },
            include: {
              patient: true,
              provider: true,
            },
          })

          if (!receiver) {
            console.error(`Receiver not found: ${data.receiverId}`)
            socket.emit('error', { message: 'Receiver not found' })
            return
          }

          // Get sender info
          const sender = await prisma.user.findUnique({
            where: { id: socket.userId },
            include: {
              patient: true,
              provider: true,
            },
          })

          // Determine the patient ID for the message
          let patientId = null
          if (sender?.role === 'PATIENT') {
            patientId = sender.patient?.id
          } else if (receiver.role === 'PATIENT') {
            patientId = receiver.patient?.id
          }

          console.log(`Creating message with patientId: ${patientId}, sender role: ${sender?.role}, receiver role: ${receiver.role}`)

          // Save message to database
          const message = await prisma.message.create({
            data: {
              senderId: socket.userId,
              receiverId: data.receiverId,
              patientId: patientId,
              content: data.content,
              isRead: false,
            },
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          })

          console.log(`Message created in database with ID: ${message.id}`)

          const messagePayload = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            senderName: `${message.sender.firstName} ${message.sender.lastName}`,
            receiverId: data.receiverId,
            timestamp: message.createdAt.toISOString(),
            isRead: message.isRead,
          }

          // Emit to receiver's room with confirmation
          const receiverRoom = `user_${data.receiverId}`
          console.log(`Emitting message to receiver room: ${receiverRoom}`)
          
          // Get all sockets in the receiver's room to confirm delivery
          const socketsInRoom = await io.in(receiverRoom).fetchSockets()
          console.log(`Found ${socketsInRoom.length} sockets in receiver room ${receiverRoom}`)
          
          io.to(receiverRoom).emit('newMessage', messagePayload)

          // Also emit back to sender for confirmation
          socket.emit('newMessage', {
            ...messagePayload,
            senderName: 'You',
          })

          console.log(`Message successfully sent from ${socket.userName} to user ${data.receiverId}`)
        } catch (error: any) {
          console.error('Error sending message:', error)
          console.error('Error details:', error.message, error.stack)
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Handle marking messages as read
      socket.on('markMessageRead', async (messageId: string) => {
        try {
          await prisma.message.update({
            where: { id: messageId },
            data: { isRead: true },
          })
        } catch (error) {
          console.error('Error marking message as read:', error)
        }
      })

      // Handle typing indicators
      socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
        socket.to(`user_${data.receiverId}`).emit('typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping: data.isTyping,
        })
      })

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`User ${socket.userName} (${socket.userId}) disconnected: ${reason}`)
        
        const userOfflineData = {
          id: socket.userId,
          name: socket.userName,
        }
        
        // Broadcast to all clients that user went offline
        io.emit('userOffline', userOfflineData)
        console.log(`Broadcasted offline status for ${socket.userName} to all clients`)
      })
    })
  }
  res.end()
}