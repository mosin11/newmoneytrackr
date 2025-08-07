import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

export async function GET() {
  try {
    await dbConnect()
    return NextResponse.json({ 
      message: 'MongoDB connected successfully',
      status: 'OK' 
    })
  } catch (error: any) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json({ 
      error: 'MongoDB connection failed',
      details: error.message 
    }, { status: 500 })
  }
}