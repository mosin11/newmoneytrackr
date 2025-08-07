import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    // Find user
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json({ error: 'Please verify your email first' }, { status: 400 })
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    })
    
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}