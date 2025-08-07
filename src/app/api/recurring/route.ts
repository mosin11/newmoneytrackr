import { NextRequest, NextResponse } from 'next/server'
import  connectDB  from '@/lib/mongodb'
import RecurringTransaction from '@/models/RecurringTransaction'
import Transaction from '@/models/Transaction'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const recurring = await RecurringTransaction.find({ email, isActive: true }).sort({ nextDue: 1 })
    return NextResponse.json({ recurring })
  } catch (error) {
    console.error('Error fetching recurring transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch recurring transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { email, type, amount, category, description, frequency, startDate, endDate } = await request.json()
    
    if (!email || !type || !amount || !category || !description || !frequency || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const nextDue = calculateNextDue(new Date(startDate), frequency)
    
    const recurring = new RecurringTransaction({
      email,
      type,
      amount: parseFloat(amount),
      category,
      description,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      nextDue
    })
    
    await recurring.save()
    
    return NextResponse.json({ message: 'Recurring transaction created successfully', recurring })
  } catch (error) {
    console.error('Error creating recurring transaction:', error)
    return NextResponse.json({ error: 'Failed to create recurring transaction' }, { status: 500 })
  }
}

function calculateNextDue(startDate: Date, frequency: string): Date {
  const next = new Date(startDate)
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  
  return next
}