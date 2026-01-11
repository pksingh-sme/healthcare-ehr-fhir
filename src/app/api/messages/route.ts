/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : route.ts
 * Component/Class: messages API Route
 * Description    : Secure messaging system API for patient-provider communication
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', { id: user.id, role: user.role })

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')
    console.log('Contact ID:', contactId)

    let messages: any[] = []

    if (contactId) {
      // Get messages between current user and specific contact
      console.log('Fetching messages between user and contact...')
      messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: user.id,
              receiverId: contactId,
            },
            {
              senderId: contactId,
              receiverId: user.id,
            },
          ],
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
    } else {
      // Get all messages for the user
      console.log('Fetching all messages for user...')
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id },
            { receiverId: user.id },
          ],
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    console.log('Messages found:', messages.length)

    // Transform messages to include proper structure for frontend
    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
      timestamp: msg.createdAt.toISOString(),
      isRead: msg.isRead,
    }))

    return NextResponse.json({
      success: true,
      data: transformedMessages,
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Creating message for user:', { id: user.id, role: user.role })

    const body = await request.json()
    const { content, receiverId } = body
    console.log('Message data:', { content, receiverId })

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      )
    }

    // Get full user info including patient/provider data
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        patient: true,
        provider: true,
      },
    })

    // Get receiver info to determine patient association
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: {
        patient: true,
        provider: true,
      },
    })

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      )
    }

    // Determine patient ID for medical record association
    let patientId = null
    if (fullUser?.role === 'PATIENT') {
      patientId = fullUser.patient?.id
    } else if (receiver.role === 'PATIENT') {
      patientId = receiver.patient?.id
    }

    const messageData = {
      content: content.trim(),
      senderId: user.id,
      receiverId: receiverId,
      patientId: patientId,
      isRead: false,
    }

    console.log('Final message data:', messageData)

    const message = await prisma.message.create({
      data: messageData,
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    console.log('Message created successfully:', message.id)

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    })
  } catch (error: any) {
    console.error('Error sending message:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, isRead } = body

    // Mark message as read
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isRead },
    })

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}