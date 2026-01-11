/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : accessibility.tsx
 * Component/Class: accessibility Utility
 * Description    : Utility library for accessibilityx
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

import { useEffect, useRef } from 'react'

// Custom hook for managing focus
export function useFocus() {
  const ref = useRef<HTMLElement>(null)
  
  const setFocus = () => {
    if (ref.current) {
      ref.current.focus()
    }
  }
  
  return [ref, setFocus] as const
}

// Custom hook for announcing content to screen readers
export function useAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.setAttribute('class', 'sr-only')
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  return announce
}

// Skip to main content link
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Skip to main content
    </a>
  )
}

// Accessible loading spinner
export function AccessibleSpinner({ 
  label = 'Loading...', 
  size = 'medium' 
}: { 
  label?: string
  size?: 'small' | 'medium' | 'large' 
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }
  
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label={label}
      >
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}

// High contrast mode toggle
export function useHighContrast() {
  const toggleHighContrast = () => {
    document.documentElement.classList.toggle('high-contrast')
  }
  
  useEffect(() => {
    // Check for user preference
    const hasHighContrastPreference = window.matchMedia('(prefers-contrast: high)').matches
    if (hasHighContrastPreference) {
      document.documentElement.classList.add('high-contrast')
    }
  }, [])
  
  return toggleHighContrast
}

// Reduced motion check
export function usePrefersReducedMotion() {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
    
  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    }
  }, [prefersReducedMotion])
  
  return prefersReducedMotion
}

// Keyboard navigation helper
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Add visible focus indicator when navigating with keyboard
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    }
    
    const handleMouseDown = () => {
      // Remove visible focus indicator when using mouse
      document.body.classList.remove('keyboard-navigation')
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
}

// ARIA live region component
export function LiveRegion({ 
  children, 
  level = 'polite' 
}: { 
  children: React.ReactNode
  level?: 'polite' | 'assertive' | 'off'
}) {
  return (
    <div
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  )
}