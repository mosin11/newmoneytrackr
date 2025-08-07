import { NextRequest, NextResponse } from 'next/server'
import  dbConnect  from '@/lib/mongodb'
import Transaction from '@/models/Transaction'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const { userEmail, type, amount, category, description, date } = await request.json()

    const transaction = new Transaction({
      userEmail,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date)
    })

    await transaction.save()
    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    const filter = searchParams.get('filter') || 'all'

    if (!userEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    let dateFilter = {}
    const now = new Date()

    switch (filter) {
      case 'daily':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        dateFilter = { date: { $gte: today } }
        break
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = { date: { $gte: weekAgo } }
        break
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = { date: { $gte: monthStart } }
        break
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        dateFilter = { date: { $gte: lastMonthStart, $lte: lastMonthEnd } }
        break
      case 'yearly':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        dateFilter = { date: { $gte: yearStart } }
        break
      default:
        dateFilter = {}
    }

    const transactions = await Transaction.find({
      userEmail,
      ...dateFilter
    }).sort({ date: -1 })

    return NextResponse.json({ transactions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}