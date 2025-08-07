import { NextRequest, NextResponse } from 'next/server'
import  dbConnect  from '@/lib/mongodb'
import Transaction from '@/models/Transaction'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    await Transaction.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
  const { params } = context; 

    await dbConnect()
    const { amount, description } = await request.json()
    
    const transaction = await Transaction.findByIdAndUpdate(
      params.id,
      { amount: parseFloat(amount), description },
      { new: true }
    )
    
    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}