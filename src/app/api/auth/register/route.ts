import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import OTP from '@/models/OTP'
import { registerSchema } from '@/lib/validation'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: validatedData.email })
    
    // Save OTP
    await OTP.create({
      email: validatedData.email,
      otp
    })
    
    // Send OTP email
    await sendOTPEmail(validatedData.email, otp)
    
    return NextResponse.json({ 
      message: 'OTP sent to your email',
      email: validatedData.email 
    })
    
  } catch (error: unknown) {
    console.error('Register API Error:', error)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}