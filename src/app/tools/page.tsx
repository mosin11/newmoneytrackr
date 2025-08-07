"use client"

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { RecurringManager } from "@/components/dashboard/RecurringManager"
import { ExportManager } from "@/components/dashboard/ExportManager"
import { ReminderManager } from "@/components/dashboard/ReminderManager"
import { SavingsGoals } from "@/components/dashboard/SavingsGoals"
import { ProtectedRoute } from "@/components/ProtectedRoute"

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

function ToolsContent() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return
      
      try {
        const response = await fetch(`/api/transactions?email=${user.email}`)
        const data = await response.json()
        
        if (response.ok) {
          setTransactions(data.transactions)
          const categories = [...new Set(data.transactions.map((t: any) => t.category))]
          setAvailableCategories(categories)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [user])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Management Tools
          </h1>
          <p className="text-muted-foreground">Manage your recurring transactions, savings goals, reminders, and data exports</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecurringManager userEmail={user.email} categories={availableCategories} />
          <SavingsGoals userEmail={user.email} />
          <ReminderManager userEmail={user.email} categories={availableCategories} />
          <ExportManager transactions={transactions} userEmail={user.email} />
        </div>
      </div>
    </div>
  )
}

export default function ToolsPage() {
  return (
    <ProtectedRoute>
      <ToolsContent />
    </ProtectedRoute>
  )
}