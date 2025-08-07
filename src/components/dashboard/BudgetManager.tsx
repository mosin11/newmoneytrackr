"use client"

import { useState, useEffect } from "react"
import { Plus, Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"

interface Budget {
  _id: string
  category: string
  amount: number
  period: string
  alertThreshold: number
  spent: number
  remaining: number
  percentage: number
  status: 'good' | 'warning' | 'exceeded'
}

interface BudgetManagerProps {
  userEmail: string
  categories: string[]
}

export function BudgetManager({ userEmail, categories }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    alertThreshold: '80'
  })
  const { showToast } = useToast()

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/budgets?email=${userEmail}`)
      const data = await response.json()
      if (response.ok) {
        setBudgets(data.budgets)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  useEffect(() => {
    if (userEmail) {
      fetchBudgets()
    }
  }, [userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category || !formData.amount) return

    setLoading(true)
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          ...formData,
          amount: parseFloat(formData.amount),
          alertThreshold: parseInt(formData.alertThreshold)
        })
      })

      if (response.ok) {
        showToast('success', 'Budget created successfully')
        setFormData({ category: '', amount: '', period: 'monthly', alertThreshold: '80' })
        setShowForm(false)
        fetchBudgets()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to create budget')
      }
    } catch (error) {
      showToast('error', 'Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'exceeded':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'exceeded':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Tracker
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Budget Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Budget amount"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Period</label>
                <Select value={formData.period} onValueChange={(value) => setFormData({...formData, period: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Alert at (%)</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} size="sm">
                {loading ? 'Creating...' : 'Create Budget'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Budget List */}
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No budgets set yet. Create your first budget to start tracking!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget._id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(budget.status)}
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-sm text-muted-foreground">({budget.period})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ₹{budget.spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {budget.percentage}% used
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(budget.status)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Remaining: ₹{budget.remaining.toLocaleString()}</span>
                  <span>
                    {budget.status === 'exceeded' ? 'Over budget!' :
                     budget.status === 'warning' ? 'Approaching limit' : 'On track'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}