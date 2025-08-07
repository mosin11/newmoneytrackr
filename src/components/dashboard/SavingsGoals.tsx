"use client"

import { useState, useEffect } from "react"
import { Plus, Target, Calendar, TrendingUp, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

interface SavingsGoal {
  _id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  progress: number
  daysLeft: number
  status: 'active' | 'completed' | 'overdue'
}

interface SavingsGoalsProps {
  userEmail: string
}

export function SavingsGoals({ userEmail }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    currentAmount: '0'
  })
  const { showToast } = useToast()

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/savings-goals?email=${userEmail}`)
      const data = await response.json()
      if (response.ok) {
        setGoals(data.goals)
      }
    } catch (error) {
      console.error('Error fetching savings goals:', error)
    }
  }

  useEffect(() => {
    if (userEmail) {
      fetchGoals()
    }
  }, [userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.targetAmount || !formData.targetDate) return

    setLoading(true)
    try {
      const response = await fetch('/api/savings-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount)
        })
      })

      if (response.ok) {
        showToast('success', 'Savings goal created successfully')
        setFormData({ title: '', description: '', targetAmount: '', targetDate: '', currentAmount: '0' })
        setShowForm(false)
        fetchGoals()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to create savings goal')
      }
    } catch (error) {
      showToast('error', 'Failed to create savings goal')
    } finally {
      setLoading(false)
    }
  }

  const updateGoalAmount = async (goalId: string, newAmount: number) => {
    try {
      const response = await fetch('/api/savings-goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, currentAmount: newAmount })
      })

      if (response.ok) {
        showToast('success', 'Goal updated successfully')
        fetchGoals()
        setEditingGoal(null)
      } else {
        showToast('error', 'Failed to update goal')
      }
    } catch (error) {
      showToast('error', 'Failed to update goal')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'overdue':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'overdue':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Savings Goals
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Goal Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Emergency Fund, Vacation"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  placeholder="Target amount"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                  placeholder="Current savings"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Date</label>
                <Input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} size="sm">
                {loading ? 'Creating...' : 'Create Goal'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No savings goals set yet. Create your first goal!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal._id} className={`p-4 border rounded-lg ${getStatusColor(goal.status)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingGoal(editingGoal === goal._id ? null : goal._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span>₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                    <span>{goal.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(goal.status)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Goal Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                  <div>
                    {goal.status === 'completed' ? '🎉 Completed!' :
                     goal.status === 'overdue' ? '⚠️ Overdue' :
                     `${goal.daysLeft} days left`}
                  </div>
                </div>

                {/* Edit Amount */}
                {editingGoal === goal._id && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Update current amount"
                        defaultValue={goal.currentAmount}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newAmount = parseFloat((e.target as HTMLInputElement).value)
                            if (newAmount >= 0) {
                              updateGoalAmount(goal._id, newAmount)
                            }
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector(`input[defaultValue="${goal.currentAmount}"]`) as HTMLInputElement
                          const newAmount = parseFloat(input.value)
                          if (newAmount >= 0) {
                            updateGoalAmount(goal._id, newAmount)
                          }
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}