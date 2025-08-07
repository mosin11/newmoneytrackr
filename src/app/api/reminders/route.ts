import { NextRequest, NextResponse } from 'next/server'
import  connectDB  from '@/lib/mongodb'
import Reminder from '@/models/Reminder'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const reminders = await Reminder.find({ 
      email, 
      isActive: true,
      isCompleted: false 
    }).sort({ dueDate: 1 })
    
    // Add status to each reminder
    const now = new Date()
    const remindersWithStatus = reminders.map(reminder => {
      const dueDate = new Date(reminder.dueDate)
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      let status = 'upcoming'
      if (daysDiff < 0) {
        status = 'overdue'
      } else if (daysDiff <= reminder.reminderDays) {
        status = 'due'
      }
      
      return {
        ...reminder.toObject(),
        status,
        daysDiff
      }
    })
    
    return NextResponse.json({ reminders: remindersWithStatus })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { email, title, description, amount, category, dueDate, frequency, reminderDays } = await request.json()
    
    if (!email || !title || !amount || !category || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const reminder = new Reminder({
      email,
      title,
      description,
      amount: parseFloat(amount),
      category,
      dueDate: new Date(dueDate),
      frequency: frequency || 'once',
      reminderDays: reminderDays || 3
    })
    
    await reminder.save()
    
    return NextResponse.json({ message: 'Reminder created successfully', reminder })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}