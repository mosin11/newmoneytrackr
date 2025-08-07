"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertTriangle, Target, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Notification {
  id: string
  type: 'budget' | 'reminder' | 'goal' | 'insight'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
}

interface NotificationCenterProps {
  userEmail: string
}

export function NotificationCenter({ userEmail }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (userEmail) {
      generateNotifications()
    }
  }, [userEmail])

  const generateNotifications = async () => {
    const mockNotifications: Notification[] = []

    try {
      // Fetch budget alerts
      const budgetResponse = await fetch(`/api/budgets?email=${userEmail}`)
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json()
        budgetData.budgets.forEach((budget: any) => {
          if (budget.status === 'warning' || budget.status === 'exceeded') {
            mockNotifications.push({
              id: `budget-${budget._id}`,
              type: 'budget',
              title: `Budget Alert: ${budget.category}`,
              message: budget.status === 'exceeded' 
                ? `You've exceeded your ${budget.category} budget by ₹${(budget.spent - budget.amount).toLocaleString()}`
                : `You've used ${budget.percentage}% of your ${budget.category} budget`,
              timestamp: new Date(),
              isRead: false
            })
          }
        })
      }

      // Fetch reminder alerts
      const reminderResponse = await fetch(`/api/reminders?email=${userEmail}`)
      if (reminderResponse.ok) {
        const reminderData = await reminderResponse.json()
        reminderData.reminders.forEach((reminder: any) => {
          if (reminder.status === 'due' || reminder.status === 'overdue') {
            mockNotifications.push({
              id: `reminder-${reminder._id}`,
              type: 'reminder',
              title: `Bill Reminder: ${reminder.title}`,
              message: reminder.status === 'overdue'
                ? `${reminder.title} is ${Math.abs(reminder.daysDiff)} days overdue`
                : `${reminder.title} is due ${reminder.daysDiff === 0 ? 'today' : `in ${reminder.daysDiff} days`}`,
              timestamp: new Date(),
              isRead: false
            })
          }
        })
      }

      // Add some general insights
      if (mockNotifications.length === 0) {
        mockNotifications.push({
          id: 'insight-1',
          type: 'insight',
          title: 'Great job tracking expenses!',
          message: 'You\'ve been consistently logging transactions. Keep it up!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false
        })
      }

    } catch (error) {
      console.error('Error generating notifications:', error)
    }

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'reminder':
        return <Calendar className="h-4 w-4 text-red-500" />
      case 'goal':
        return <Target className="h-4 w-4 text-blue-500" />
      case 'insight':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <>
      {/* Bell Icon */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-2"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        notification.isRead ? 'bg-muted/50' : 'bg-background border-primary/20'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}