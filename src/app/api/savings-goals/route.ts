import { NextRequest, NextResponse } from 'next/server'
import  connectDB  from '@/lib/mongodb'
import SavingsGoal from '@/models/SavingsGoal'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const goals = await SavingsGoal.find({ email, isActive: true }).sort({ targetDate: 1 })
    
    const goalsWithProgress = goals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100
      const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...goal.toObject(),
        progress: Math.min(progress, 100),
        daysLeft: Math.max(daysLeft, 0),
        status: goal.isCompleted ? 'completed' : daysLeft < 0 ? 'overdue' : 'active'
      }
    })
    
    return NextResponse.json({ goals: goalsWithProgress })
  } catch (error) {
    console.error('Error fetching savings goals:', error)
    return NextResponse.json({ error: 'Failed to fetch savings goals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { email, title, description, targetAmount, targetDate, currentAmount } = await request.json()
    
    if (!email || !title || !targetAmount || !targetDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const goal = new SavingsGoal({
      email,
      title,
      description,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      targetDate: new Date(targetDate)
    })
    
    await goal.save()
    
    return NextResponse.json({ message: 'Savings goal created successfully', goal })
  } catch (error) {
    console.error('Error creating savings goal:', error)
    return NextResponse.json({ error: 'Failed to create savings goal' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const { id, currentAmount } = await request.json()
    
    if (!id || currentAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const goal = await SavingsGoal.findByIdAndUpdate(
      id,
      { currentAmount: parseFloat(currentAmount) },
      { new: true }
    )
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Goal updated successfully', goal })
  } catch (error) {
    console.error('Error updating savings goal:', error)
    return NextResponse.json({ error: 'Failed to update savings goal' }, { status: 500 })
  }
}