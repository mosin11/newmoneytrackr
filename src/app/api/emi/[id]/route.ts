import { NextRequest, NextResponse } from 'next/server'
import  dbConnect  from '@/lib/mongodb'
import EMI from '@/models/EMI'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { id } = params

    const updatedEMI = await EMI.findByIdAndUpdate(id, body, { new: true })
    
    if (!updatedEMI) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'EMI updated successfully', emi: updatedEMI })
  } catch (error) {
    console.error('Error updating EMI:', error)
    return NextResponse.json({ error: 'Failed to update EMI' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    
    const { id } = params

    const deletedEMI = await EMI.findByIdAndDelete(id)
    
    if (!deletedEMI) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'EMI deleted successfully' })
  } catch (error) {
    console.error('Error deleting EMI:', error)
    return NextResponse.json({ error: 'Failed to delete EMI' }, { status: 500 })
  }
}