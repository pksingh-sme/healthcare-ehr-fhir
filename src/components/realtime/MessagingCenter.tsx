/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : MessagingCenter.tsx
 * Component/Class: MessagingCenter Component
 * Description    : Real-time messaging center for secure communications
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

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Send, User, Clock, MessageCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSocket } from '@/contexts/SocketContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  name: string
  role: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isOnline: boolean
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
  senderName: string
}

const MessagingCenter = React.memo(() => {
  const { user, token } = useAuth()
  const { 
    messages, 
    sendMessage, 
    markMessageAsRead, 
    onlineUsers,
    isConnected 
  } = useSocket()
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [contactMessages, setContactMessages] = useState<{ [contactId: string]: Message[] }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Persist selected contact
  useEffect(() => {
    const savedContactId = localStorage.getItem('selected-contact-id')
    if (savedContactId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === savedContactId)
      if (contact) {
        console.log('Restoring selected contact:', contact.name)
        setSelectedContact(contact)
      }
    }
  }, [contacts])

  const handleContactSelect = (contact: Contact) => {
    console.log('Selecting contact:', contact.name)
    setSelectedContact(contact)
    localStorage.setItem('selected-contact-id', contact.id)
  }

  // Fetch messages for a specific contact
  const fetchContactMessages = useCallback(async (contactId: string) => {
    if (!token || !user) return
    
    try {
      const response = await fetch(`/api/messages?contactId=${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setContactMessages(prev => ({
          ...prev,
          [contactId]: data.data || []
        }))
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error)
    }
  }, [token, user])

  // Fetch messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      console.log(`Fetching initial messages for contact: ${selectedContact.name}`)
      fetchContactMessages(selectedContact.id)
      
      // Set up periodic refresh for active conversation
      const refreshInterval = setInterval(() => {
        if (isConnected) {
          console.log(`Periodic refresh of messages for ${selectedContact.name}`)
          fetchContactMessages(selectedContact.id)
        }
      }, 10000) // Refresh every 10 seconds instead of 5
      
      return () => {
        clearInterval(refreshInterval)
      }
    }
  }, [selectedContact, fetchContactMessages, isConnected])

  // Listen for new messages from socket - only add messages for currently selected contact
  useEffect(() => {
    if (!selectedContact || !user) return
    
    console.log(`Setting up message listener for contact: ${selectedContact.name} (${selectedContact.id})`)
    
    // Filter messages for the current conversation
    const relevantMessages = messages.filter(msg => 
      (msg.senderId === selectedContact.id && msg.receiverId === user.id) ||
      (msg.senderId === user.id && msg.receiverId === selectedContact.id)
    )
    
    console.log(`Found ${relevantMessages.length} relevant messages for current conversation`)
    
    if (relevantMessages.length > 0) {
      setContactMessages(prev => {
        const contactId = selectedContact.id
        const existingMessages = prev[contactId] || []
        
        // Create a Set of existing message IDs for efficient lookup
        const existingIds = new Set(existingMessages.map(msg => msg.id))
        
        // Filter out temporary messages and duplicates
        const nonTempExisting = existingMessages.filter(msg => !msg.id.startsWith('temp-'))
        
        // Add only new messages that don't already exist
        const newUniqueMessages = relevantMessages.filter(msg => !existingIds.has(msg.id))
        
        if (newUniqueMessages.length === 0) {
          return prev // No new messages to add
        }
        
        console.log(`Adding ${newUniqueMessages.length} new messages to contact ${selectedContact.name}`)
        const allMessages = [...nonTempExisting, ...newUniqueMessages]
        
        return {
          ...prev,
          [contactId]: allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        }
      })
    }
  }, [messages, selectedContact, user])
  
  // Auto-refresh messages when contact changes or when socket reconnects
  useEffect(() => {
    if (selectedContact && isConnected) {
      console.log(`Refreshing messages for contact: ${selectedContact.name} due to connection change`)
      fetchContactMessages(selectedContact.id)
    }
  }, [selectedContact, isConnected, fetchContactMessages])

  // Fetch real contacts from the API
  useEffect(() => {
    const fetchContacts = async () => {
      if (!token || !user) return
      
      try {
        setLoading(true)
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          const allUsers = data.data || []
          
          // Filter contacts based on user role
          let filteredUsers = allUsers.filter((u: any) => u.id !== user.id)
          
          if (user.role === 'PATIENT') {
            // Patients should only see providers (doctors and nurses)
            filteredUsers = filteredUsers.filter((u: any) => u.role === 'PROVIDER')
          } else if (user.role === 'PROVIDER') {
            // Providers should see patients and other providers, but not admins
            filteredUsers = filteredUsers.filter((u: any) => 
              u.role === 'PATIENT' || u.role === 'PROVIDER'
            )
          }
          // Admins can see everyone (no additional filtering)
          
          const formattedContacts: Contact[] = filteredUsers
            .map((u: any) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              role: u.role === 'PROVIDER' ? (u.provider?.specialty || 'Provider') : 
                   u.role === 'PATIENT' ? 'Patient' : 'Admin',
              lastMessage: '',
              lastMessageTime: '',
              unreadCount: 0,
              isOnline: onlineUsers.some(online => online.id === u.id),
            }))
          
          setContacts(formattedContacts)
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [token, user, onlineUsers])

  // Update online status for contacts
  useEffect(() => {
    console.log('Updating contact online status. Online users:', onlineUsers.map(u => u.name))
    setContacts(prev => prev.map(contact => {
      const isOnline = onlineUsers.some(online => online.id === contact.id)
      if (contact.isOnline !== isOnline) {
        console.log(`Contact ${contact.name} status changed to: ${isOnline ? 'ONLINE' : 'OFFLINE'}`)
      }
      return {
        ...contact,
        isOnline: isOnline
      }
    }))
  }, [onlineUsers])

  // Auto-scroll to bottom when new messages arrive for the selected contact
  useEffect(() => {
    if (selectedContact && selectedContactMessages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [selectedContactMessages, selectedContact])

  // Auto-scroll when contact changes (to show existing messages)
  useEffect(() => {
    if (selectedContact) {
      // Immediate scroll when switching contacts
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    }
  }, [selectedContact])

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [contacts, searchTerm])

  const selectedContactMessages = useMemo(() => {
    if (!selectedContact || !user) return []
    
    return contactMessages[selectedContact.id] || []
  }, [contactMessages, selectedContact, user])

  const handleSendMessage = useCallback(() => {
    if (messageInput.trim() && selectedContact && isConnected && user) {
      const messageContent = messageInput.trim()
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const tempMessage: Message = {
        id: tempId,
        senderId: user.id,
        receiverId: selectedContact.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
        isRead: false,
        senderName: 'You',
      }
      
      // Optimistically add message to UI
      setContactMessages(prev => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), tempMessage]
      }))
      
      // Send message via socket
      sendMessage(selectedContact.id, messageContent)
      setMessageInput('')
      
      // Immediate scroll to show the sent message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      
      // Remove the temporary message after socket confirms real message received
      setTimeout(() => {
        setContactMessages(prev => {
          const currentMessages = prev[selectedContact.id] || []
          // Only remove temp message if a real message with same content exists
          const hasRealMessage = currentMessages.some(msg => 
            !msg.id.startsWith('temp-') && 
            msg.content === messageContent && 
            msg.senderId === user.id &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(tempMessage.timestamp).getTime()) < 30000 // 30 second window
          )
          
          if (hasRealMessage) {
            return {
              ...prev,
              [selectedContact.id]: currentMessages.filter(msg => msg.id !== tempId)
            }
          }
          return prev
        })
      }, 3000) // Check after 3 seconds
    }
  }, [messageInput, selectedContact, isConnected, sendMessage, user])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center border rounded-lg bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            Messages
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="space-y-1">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No contacts found
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors",
                    selectedContact?.id === contact.id && "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        {contact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {contact.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {contact.isOnline && (
                        <Badge variant="secondary" className="text-xs">
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  {selectedContact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedContact.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedContact.role} • {selectedContact.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
              {selectedContactMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                selectedContactMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.senderId === user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm",
                        message.senderId === user?.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      )}
                    >
                      <p>{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span
                          className={cn(
                            "text-xs",
                            message.senderId === user?.id
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.senderId === user?.id && (
                          <span
                            className={cn(
                              "text-xs ml-2",
                              message.isRead ? "text-blue-100" : "text-blue-200"
                            )}
                          >
                            {message.isRead ? "Read" : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={!isConnected}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  className="clinic-gradient text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">
                  Connection lost. Messages will be sent when reconnected.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a contact</h3>
              <p className="text-sm">Choose a contact from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

MessagingCenter.displayName = 'MessagingCenter'

export { MessagingCenter }