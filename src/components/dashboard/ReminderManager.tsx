"use client"

import { useState, useEffect } from "react"
import { Plus, Bell, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"

interface Reminder {
  _id: string
  title: string
  description: string
  amount: number
  category: string
  dueDate: string
  frequency: string
  reminderDays: number
  status: 'upcoming' | 'due' | 'overdue'
  daysDiff: number
}

interface ReminderManagerProps {
  userEmail: string
  categories: string[]
}

export function ReminderManager({ userEmail, categories }: ReminderManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    dueDate: '',
    frequency: 'once',
    reminderDays: '3'
  })
  const { showToast } = useToast()

  const fetchReminders = async () => {
    try {
      const response = await fetch(`/api/reminders?email=${userEmail}`)
      const data = await response.json()
      if (response.ok) {
        setReminders(data.reminders)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  useEffect(() => {
    if (userEmail) {
      fetchReminders()
    }
  }, [userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.amount || !formData.category || !formData.dueDate) return

    setLoading(true)
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          ...formData,
          amount: parseFloat(formData.amount),
          reminderDays: parseInt(formData.reminderDays)
        })
      })

      if (response.ok) {
        showToast('success', 'Reminder created successfully')
        setFormData({
          title: '',
          description: '',
          amount: '',
          category: '',
          dueDate: '',
          frequency: 'once',
          reminderDays: '3'
        })
        setShowForm(false)
        fetchReminders()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to create reminder')
      }
    } catch (error) {
      showToast('error', 'Failed to create reminder')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'due':
        return <Bell className="h-4 w-4 text-yellow-500" />
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'border-red-200 bg-red-50'
      case 'due':
        return 'border-yellow-200 bg-yellow-50'
      case 'upcoming':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusText = (reminder: Reminder) => {
    if (reminder.status === 'overdue') {
      return `${Math.abs(reminder.daysDiff)} days overdue`
    } else if (reminder.status === 'due') {
      return reminder.daysDiff === 0 ? 'Due today' : `Due in ${reminder.daysDiff} days`
    } else {
      return `Due in ${reminder.daysDiff} days`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bill Reminders
            {reminders.filter(r => r.status === 'due' || r.status === 'overdue').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {reminders.filter(r => r.status === 'due' || r.status === 'overdue').length}
              </span>
            )}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Electricity Bill"
                />
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
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Remind me (days before)</label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.reminderDays}
                  onChange={(e) => setFormData({...formData, reminderDays: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} size="sm">
                {loading ? 'Creating...' : 'Create Reminder'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bill reminders set up yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder._id} className={`p-4 border rounded-lg ${getStatusColor(reminder.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(reminder.status)}
                      <span className="font-medium">{reminder.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {reminder.category} • ₹{reminder.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Due: {formatDate(reminder.dueDate)}</span>
                      <span className={`font-medium ${
                        reminder.status === 'overdue' ? 'text-red-600' :
                        reminder.status === 'due' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {getStatusText(reminder)}
                      </span>
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