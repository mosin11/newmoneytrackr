"use client"

import { useState, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/dashboard/TransactionForm"

export function FloatingAddButton() {
  const [showModal, setShowModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // Set initial position - adjust for mobile
    const isMobile = window.innerWidth < 768
    const buttonSize = isMobile ? 48 : 56
    const margin = isMobile ? 16 : 24
    setPosition({ 
      x: window.innerWidth - buttonSize - margin, 
      y: window.innerHeight - buttonSize - margin 
    })
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const touch = e.touches[0]
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragRef.current.hasMoved = true
    }
    
    const isMobile = window.innerWidth < 768
    const buttonSize = isMobile ? 48 : 56
    const newX = Math.max(0, Math.min(window.innerWidth - buttonSize, dragRef.current.initialX + deltaX))
    const newY = Math.max(0, Math.min(window.innerHeight - buttonSize, dragRef.current.initialY + deltaY))
    
    setPosition({ x: newX, y: newY })
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragRef.current.startX
    const deltaY = touch.clientY - dragRef.current.startY
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragRef.current.hasMoved = true
    }
    
    const isMobile = window.innerWidth < 768
    const buttonSize = isMobile ? 48 : 56
    const newX = Math.max(0, Math.min(window.innerWidth - buttonSize, dragRef.current.initialX + deltaX))
    const newY = Math.max(0, Math.min(window.innerHeight - buttonSize, dragRef.current.initialY + deltaY))
    
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only open modal if button wasn't dragged
    if (!dragRef.current.hasMoved) {
      setShowModal(true)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging])

  if (!user) return null

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="fixed h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 cursor-move select-none bg-blue-600 hover:bg-blue-700 text-white touch-none"
        style={{ left: position.x, top: position.y }}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {showModal && (
        <TransactionForm
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            // Trigger custom event to refresh data
            window.dispatchEvent(new CustomEvent('transactionAdded'))
          }}
          userEmail={user.email}
        />
      )}
    </>
  )
}