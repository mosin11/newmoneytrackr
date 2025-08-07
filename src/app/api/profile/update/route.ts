import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import OTP from '@/models/OTP'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email, otp, field, value, currentPassword } = await request.json()
    
    if (!email || !otp || !field || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Find and verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp 
    })
    
    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }
    
    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Validate current password for password changes
    if (field === 'password') {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      }
      
      const isPasswordValid = await user.comparePassword(currentPassword)
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
    }
    
    // Update user field
    const updateData: any = {}
    
    if (field === 'name') {
      updateData.name = value
    } else if (field === 'email') {
      // Check if new email already exists
      const existingUser = await User.findOne({ email: value, _id: { $ne: user._id } })
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      updateData.email = value
    } else if (field === 'password') {
      updateData.password = await bcrypt.hash(value, 12)
    }
    
    // Update user
    await User.findByIdAndUpdate(user._id, updateData)
    
    // Delete OTP after successful update
    await OTP.deleteOne({ _id: otpRecord._id })
    
    // Get updated user
    const updatedUser = await User.findById(user._id).select('-password')
    
    return NextResponse.json({ 
      message: `${field} updated successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified
      }
    })
    
  } catch (error: any) {
    console.error('Update Profile Error:', error)
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error.message 
    }, { status: 500 })
  }
}