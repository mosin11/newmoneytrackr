import { NextRequest, NextResponse } from 'next/server'
import  connectDB  from '@/lib/mongodb'
import Budget from '@/models/Budget'
import Transaction from '@/models/Transaction'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const budgets = await Budget.find({ email, isActive: true }).sort({ category: 1 })
    
    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const now = new Date()
        let startDate: Date
        
        switch (budget.period) {
          case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default: // monthly
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }
        
        const spent = await Transaction.aggregate([
          {
            $match: {
              email,
              type: 'out',
              category: budget.category,
              date: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ])
        
        const totalSpent = spent[0]?.total || 0
        const percentage = (totalSpent / budget.amount) * 100
        
        return {
          ...budget.toObject(),
          spent: totalSpent,
          remaining: budget.amount - totalSpent,
          percentage: Math.round(percentage),
          status: percentage >= 100 ? 'exceeded' : 
                  percentage >= budget.alertThreshold ? 'warning' : 'good'
        }
      })
    )
    
    return NextResponse.json({ budgets: budgetsWithSpending })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { email, category, amount, period, alertThreshold } = await request.json()
    
    if (!email || !category || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const budget = new Budget({
      email,
      category,
      amount: parseFloat(amount),
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80
    })
    
    await budget.save()
    
    return NextResponse.json({ message: 'Budget created successfully', budget })
  } catch (error) {
    if ((error as any)?.code === 11000) {
      return NextResponse.json({ error: 'Budget already exists for this category and period' }, { status: 400 })
    }
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}