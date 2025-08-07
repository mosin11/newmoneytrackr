import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import OTP from '@/models/OTP'
import { otpSchema, registerSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { email, otp, userData } = body
    
    // Validate OTP data
    const validatedOTP = otpSchema.parse({ email, otp })
    
    // Find and verify OTP
    const otpRecord = await OTP.findOne({ 
      email: validatedOTP.email, 
      otp: validatedOTP.otp 
    })
    
    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }
    
    // Validate user data
    const validatedUserData = registerSchema.parse(userData)
    
    // Create user
    const user = await User.create({
      ...validatedUserData,
      isVerified: true
    })
    
    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id })
    
    return NextResponse.json({ 
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    })
    
  } catch (error: any) {
    console.error('Verify OTP API Error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}