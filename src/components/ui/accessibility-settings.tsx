/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : accessibility-settings.tsx
 * Component/Class: accessibility-settings Component
 * Description    : UI component for accessibility-settings
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTheme } from '@/contexts/ThemeContext'
import { useHighContrast, usePrefersReducedMotion } from '@/lib/accessibility'

export function AccessibilitySettings() {
  const { theme, setTheme } = useTheme()
  const toggleHighContrast = useHighContrast()
  const prefersReducedMotion = usePrefersReducedMotion()
  
  const [settings, setSettings] = useState({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    focusIndicators: true,
    screenReaderOptimized: false,
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Apply settings immediately
    if (key === 'highContrast') {
      if (value) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
    }
    
    if (key === 'reducedMotion') {
      if (value) {
        document.documentElement.classList.add('reduce-motion')
      } else {
        document.documentElement.classList.remove('reduce-motion')
      }
    }
    
    if (key === 'largeText') {
      if (value) {
        document.documentElement.classList.add('large-text')
      } else {
        document.documentElement.classList.remove('large-text')
      }
    }
    
    if (key === 'focusIndicators') {
      if (value) {
        document.documentElement.classList.add('enhanced-focus')
      } else {
        document.documentElement.classList.remove('enhanced-focus')
      }
    }
  }

  const resetToDefaults = () => {
    setSettings({
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      focusIndicators: true,
      screenReaderOptimized: false,
    })
    
    // Remove all accessibility classes
    document.documentElement.classList.remove(
      'high-contrast',
      'reduce-motion',
      'large-text',
      'enhanced-focus'
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize your experience to meet your accessibility needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Color Theme</Label>
          <div className="flex space-x-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              System
            </Button>
          </div>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="high-contrast" className="text-sm font-medium">
              High Contrast Mode
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Increases contrast for better visibility
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSetting('highContrast', checked)}
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="reduced-motion" className="text-sm font-medium">
              Reduce Motion
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Minimizes animations and transitions
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion || prefersReducedMotion}
            onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
            disabled={prefersReducedMotion}
          />
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="large-text" className="text-sm font-medium">
              Large Text
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Increases font size throughout the application
            </p>
          </div>
          <Switch
            id="large-text"
            checked={settings.largeText}
            onCheckedChange={(checked) => updateSetting('largeText', checked)}
          />
        </div>

        {/* Enhanced Focus Indicators */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="focus-indicators" className="text-sm font-medium">
              Enhanced Focus Indicators
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Makes keyboard navigation more visible
            </p>
          </div>
          <Switch
            id="focus-indicators"
            checked={settings.focusIndicators}
            onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
          />
        </div>

        {/* Screen Reader Optimization */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="screen-reader" className="text-sm font-medium">
              Screen Reader Optimization
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optimizes interface for screen reader users
            </p>
          </div>
          <Switch
            id="screen-reader"
            checked={settings.screenReaderOptimized}
            onCheckedChange={(checked) => updateSetting('screenReaderOptimized', checked)}
          />
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium mb-2 block">Keyboard Shortcuts</Label>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Toggle theme:</span>
              <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Cmd/Ctrl + D</kbd>
            </div>
            <div className="flex justify-between">
              <span>Skip to main content:</span>
              <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Tab</kbd>
            </div>
            <div className="flex justify-between">
              <span>Close dialogs:</span>
              <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Escape</kbd>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}