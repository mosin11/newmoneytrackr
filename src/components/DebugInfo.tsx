"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugInfoProps {
  user: any
  transactions: any[]
  budgets: any[]
  savingsGoals: any[]
}

export function DebugInfo({ user, transactions, budgets, savingsGoals }: DebugInfoProps) {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        Debug Info
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Debug Info</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}
          </div>
          <div>
            <strong>Transactions:</strong> {transactions.length} items
          </div>
          <div>
            <strong>Budgets:</strong> {budgets.length} items
          </div>
          <div>
            <strong>Savings Goals:</strong> {savingsGoals.length} items
          </div>
          <div>
            <strong>Features Available:</strong>
            <ul className="ml-2 mt-1">
              <li>✅ Transaction Management</li>
              <li>✅ Budget Planning (/budgets)</li>
              <li>✅ Financial Health Score</li>
              <li>✅ Savings Goals</li>
              <li>✅ Bill Reminders</li>
              <li>✅ Charts & Analytics</li>
              <li>✅ Export Data</li>
              <li>✅ Notifications</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}