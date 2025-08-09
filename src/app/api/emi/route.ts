import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EMI from '@/models/EMI'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emis = await EMI.find({ userEmail: email }).sort({ createdAt: -1 })
    
    return NextResponse.json({ emis })
  } catch (error) {
    console.error('Error fetching EMIs:', error)
    return NextResponse.json({ error: 'Failed to fetch EMIs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      userEmail,
      name,
      totalAmount,
      monthlyAmount,
      startDate,
      endDate,
      totalMonths,
      remainingMonths,
      interestRate,
      category,
      status,
      nextDueDate
    } = body

    if (!userEmail || !name || !totalAmount || !monthlyAmount || !startDate || !totalMonths) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emi = new EMI({
      userEmail,
      name,
      totalAmount,
      monthlyAmount,
      startDate,
      endDate,
      totalMonths,
      remainingMonths,
      interestRate: interestRate || 0,
      category,
      status: status || 'active',
      nextDueDate
    })

    await emi.save()
    
    return NextResponse.json({ message: 'EMI created successfully', emi }, { status: 201 })
  } catch (error) {
    console.error('Error creating EMI:', error)
    return NextResponse.json({ error: 'Failed to create EMI' }, { status: 500 })
  }
}