"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(() => console.log('SW registration failed'))
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    setDeferredPrompt(null)
  }

  if (!showInstallBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium">Install MoneyTrackr</p>
        <p className="text-sm opacity-90">Get quick access from your home screen</p>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleInstall}
          className="bg-white text-blue-600 hover:bg-gray-100"
        >
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="text-white hover:bg-blue-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}