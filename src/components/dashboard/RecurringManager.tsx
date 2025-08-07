"use client"

import { useState, useEffect } from "react"
import { Plus, Repeat, Calendar, Trash2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"

interface RecurringTransaction {
  _id: string
  type: 'in' | 'out'
  amount: number
  category: string
  description: string
  frequency: string
  nextDue: string
  isActive: boolean
}

interface RecurringManagerProps {
  userEmail: string
  categories: string[]
}

export function RecurringManager({ userEmail, categories }: RecurringManagerProps) {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'out' as 'in' | 'out',
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  })
  const { showToast } = useToast()

  const fetchRecurring = async () => {
    try {
      const response = await fetch(`/api/recurring?email=${userEmail}`)
      const data = await response.json()
      if (response.ok) {
        setRecurring(data.recurring)
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
    }
  }

  useEffect(() => {
    if (userEmail) {
      fetchRecurring()
    }
  }, [userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category || !formData.description) return

    setLoading(true)
    try {
      const response = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        showToast('success', 'Recurring transaction created successfully')
        setFormData({
          type: 'out',
          amount: '',
          category: '',
          description: '',
          frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0]
        })
        setShowForm(false)
        fetchRecurring()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to create recurring transaction')
      }
    } catch (error) {
      showToast('error', 'Failed to create recurring transaction')
    } finally {
      setLoading(false)
    }
  }

  const processRecurring = async () => {
    try {
      const response = await fetch('/api/recurring/process', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        showToast('success', data.message)
        fetchRecurring()
        window.dispatchEvent(new Event('transactionAdded'))
      } else {
        showToast('error', 'Failed to process recurring transactions')
      }
    } catch (error) {
      showToast('error', 'Failed to process recurring transactions')
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly', 
      monthly: 'Monthly',
      yearly: 'Yearly'
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recurring Transactions
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={processRecurring}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Process Due
            </Button>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Recurring
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value: 'in' | 'out') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Income</SelectItem>
                    <SelectItem value="out">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Amount"
                />
              </div>
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
                <label className="text-sm font-medium">Frequency</label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} size="sm">
                {loading ? 'Creating...' : 'Create Recurring'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Recurring List */}
        {recurring.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recurring transactions set up yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recurring.map((item) => (
              <div key={item._id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.type === 'in' ? 'Income' : 'Expense'}
                      </span>
                      <span className="font-medium">{item.description}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.category} • ₹{item.amount.toLocaleString()} • {getFrequencyLabel(item.frequency)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      Next due: {formatDate(item.nextDue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}