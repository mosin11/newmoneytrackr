"use client"

import { useState, useEffect } from "react"
import { BudgetManager } from "@/components/dashboard/BudgetManager"
import { ProtectedRoute } from "@/components/ProtectedRoute"

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

function BudgetsContent() {
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.email) return
      
      try {
        const response = await fetch(`/api/transactions?email=${user.email}`)
        const data = await response.json()
        
        if (response.ok) {
          const uniqueCategories = [...new Set(
            data.transactions
              .filter((t: any) => t.type === 'out')
              .map((t: any) => t.category)
          )] as string[]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [user])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Budget Planning</h1>
          <p className="text-muted-foreground">Set and track your spending limits</p>
        </div>
        
        <BudgetManager userEmail={user.email} categories={categories} />
      </div>
    </div>
  )
}

export default function BudgetsPage() {
  return (
    <ProtectedRoute>
      <BudgetsContent />
    </ProtectedRoute>
  )
}