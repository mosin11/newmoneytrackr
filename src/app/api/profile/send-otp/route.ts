import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import OTP from '@/models/OTP'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email, field, value } = await request.json()
    
    if (!email || !field || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Delete any existing OTP for this email
    await OTP.deleteMany({ email })
    
    // Save OTP
    await OTP.create({
      email,
      otp,
      metadata: { field, value } // Store what's being updated
    })
    
    // Send OTP email
    await sendOTPEmail(email, otp)
    
    return NextResponse.json({ 
      message: 'OTP sent to your email',
      field,
      value 
    })
    
  } catch (error: any) {
    console.error('Send OTP Error:', error)
    return NextResponse.json({ 
      error: 'Failed to send OTP',
      details: error.message 
    }, { status: 500 })
  }
}