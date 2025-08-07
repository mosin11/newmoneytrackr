import { NextRequest, NextResponse } from 'next/server'
import  connectDB  from '@/lib/mongodb'
import RecurringTransaction from '@/models/RecurringTransaction'
import Transaction from '@/models/Transaction'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const now = new Date()
    const dueRecurring = await RecurringTransaction.find({
      isActive: true,
      nextDue: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    })

    let processed = 0
    
    for (const recurring of dueRecurring) {
      // Create the transaction
      const transaction = new Transaction({
        email: recurring.email,
        type: recurring.type,
        amount: recurring.amount,
        category: recurring.category,
        description: `${recurring.description} (Auto)`,
        date: now
      })
      
      await transaction.save()
      
      // Update next due date
      const nextDue = calculateNextDue(recurring.nextDue, recurring.frequency)
      
      await RecurringTransaction.findByIdAndUpdate(recurring._id, {
        nextDue,
        lastProcessed: now
      })
      
      processed++
    }
    
    return NextResponse.json({ 
      message: `Processed ${processed} recurring transactions`,
      processed 
    })
  } catch (error) {
    console.error('Error processing recurring transactions:', error)
    return NextResponse.json({ error: 'Failed to process recurring transactions' }, { status: 500 })
  }
}

function calculateNextDue(currentDue: Date, frequency: string): Date {
  const next = new Date(currentDue)
  
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