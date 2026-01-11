/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : AIChatbot.tsx
 * Component/Class: AIChatbot Component
 * Description    : AI-powered chatbot interface for patient assistance
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

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  urgency?: 'low' | 'medium' | 'high'
  suggestions?: string[]
}

interface AIResponse {
  content: string
  urgency: 'low' | 'medium' | 'high'
  suggestions: string[]
  needsImmediateAttention: boolean
}

export function AIChatbot() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: user?.role === 'PATIENT' 
        ? "Hello! I'm your AI health assistant. I can help you understand symptoms and determine if you need immediate care. Please describe how you're feeling."
        : "Hello! I'm your AI clinical assistant. I can help with diagnosis suggestions, treatment recommendations, and clinical decision support. How can I assist you today?",
      timestamp: new Date(),
      urgency: 'low',
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const getAIResponse = (userInput: string): AIResponse => {
    const input = userInput.toLowerCase()
    
    // Emergency symptoms detection
    const emergencyKeywords = ['chest pain', 'difficulty breathing', 'shortness of breath', 'severe pain', 'bleeding', 'unconscious', 'heart attack', 'stroke']
    const isEmergency = emergencyKeywords.some(keyword => input.includes(keyword))
    
    if (isEmergency) {
      return {
        content: "⚠️ URGENT: Based on your symptoms, you may need immediate medical attention. Please call 911 or go to the nearest emergency room immediately. Do not wait.",
        urgency: 'high',
        suggestions: ['Call 911', 'Go to Emergency Room', 'Contact Emergency Services'],
        needsImmediateAttention: true,
      }
    }

    // Common symptoms triage
    if (input.includes('fever') || input.includes('temperature')) {
      return {
        content: "I understand you have a fever. This could indicate an infection. How high is your temperature? Do you have any other symptoms like chills, body aches, or fatigue?",
        urgency: 'medium',
        suggestions: ['Schedule appointment', 'Monitor temperature', 'Rest and hydrate', 'Take fever reducer'],
        needsImmediateAttention: false,
      }
    }

    if (input.includes('headache') || input.includes('head pain')) {
      return {
        content: "Headaches can have various causes. How would you rate the pain on a scale of 1-10? Is this a new type of headache for you? Any nausea or vision changes?",
        urgency: 'low',
        suggestions: ['Track symptoms', 'Try rest in dark room', 'Stay hydrated', 'Consider scheduling appointment'],
        needsImmediateAttention: false,
      }
    }

    if (input.includes('cough') || input.includes('cold')) {
      return {
        content: "Coughs and cold symptoms are common. How long have you had these symptoms? Do you have a fever, body aches, or difficulty breathing?",
        urgency: 'low',
        suggestions: ['Rest and fluids', 'Monitor symptoms', 'Schedule appointment if worsening', 'Avoid contact with others'],
        needsImmediateAttention: false,
      }
    }

    if (input.includes('stomach') || input.includes('nausea') || input.includes('vomiting')) {
      return {
        content: "Digestive issues can be uncomfortable. How long have you been experiencing these symptoms? Any fever, severe pain, or signs of dehydration?",
        urgency: 'medium',
        suggestions: ['Stay hydrated', 'BRAT diet', 'Monitor symptoms', 'Schedule appointment if severe'],
        needsImmediateAttention: false,
      }
    }

    // Clinical decision support for providers
    if (user?.role !== 'PATIENT') {
      if (input.includes('diabetes') || input.includes('blood sugar')) {
        return {
          content: "For diabetes management, consider: HbA1c levels, medication adherence, lifestyle factors. Current guidelines recommend HbA1c <7% for most adults. May need endocrinology referral if poorly controlled.",
          urgency: 'low',
          suggestions: ['Check HbA1c', 'Review medications', 'Lifestyle counseling', 'Consider specialist referral'],
          needsImmediateAttention: false,
        }
      }

      if (input.includes('hypertension') || input.includes('blood pressure')) {
        return {
          content: "Hypertension management: Target <130/80 for most patients. Consider lifestyle modifications first, then medication. Monitor for target organ damage.",
          urgency: 'low',
          suggestions: ['Lifestyle counseling', 'Medication review', 'Cardiovascular risk assessment', 'Follow-up scheduling'],
          needsImmediateAttention: false,
        }
      }
    }

    // Default response
    return {
      content: "I understand your concern. Can you provide more specific details about your symptoms? When did they start, how severe are they, and have you noticed any patterns?",
      urgency: 'low',
      suggestions: ['Describe symptoms in detail', 'Note when symptoms started', 'Rate severity 1-10', 'Schedule appointment'],
      needsImmediateAttention: false,
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        urgency: aiResponse.urgency,
        suggestions: aiResponse.suggestions,
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          AI Health Assistant
        </CardTitle>
        <CardDescription>
          {user?.role === 'PATIENT' 
            ? 'Get instant symptom guidance and triage support'
            : 'Clinical decision support and diagnostic assistance'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : `${getUrgencyColor(message.urgency)} border-2`
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.urgency && message.type === 'ai' && (
                  <div className="mt-2">
                    <Badge 
                      variant={message.urgency === 'high' ? 'destructive' : 
                               message.urgency === 'medium' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {message.urgency} priority
                    </Badge>
                  </div>
                )}
                {message.suggestions && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium opacity-75">Suggestions:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 mr-1 mb-1"
                        onClick={() => setInputMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              user?.role === 'PATIENT' 
                ? "Describe your symptoms..."
                : "Ask about diagnosis, treatment, or clinical guidelines..."
            }
            disabled={isTyping}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isTyping}
            className="clinic-gradient text-white"
          >
            Send
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          {user?.role === 'PATIENT' 
            ? '⚠️ This AI assistant provides general guidance only. For emergencies, call 911. Always consult healthcare professionals for medical decisions.'
            : '⚠️ AI suggestions are for clinical decision support only. Always use professional judgment and follow institutional protocols.'
          }
        </p>
      </CardContent>
    </Card>
  )
}