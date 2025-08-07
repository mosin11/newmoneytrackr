import { NextRequest, NextResponse } from 'next/server'
import  dbConnect  from '@/lib/mongodb'
import User from '@/models/User'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to user
    await User.updateOne(
      { email },
      { resetToken, resetTokenExpiry }
    )

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    // Email content
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">MoneyTrackr</h1>
          <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password for your MoneyTrackr account.
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            Click the button below to reset your password. This link will expire in 1 hour.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This email was sent from MoneyTrackr</p>
        </div>
      </div>
    `

    // Send email
    await sendEmail({
      to: email,
      subject: 'Reset Your MoneyTrackr Password',
      html: emailHtml
    })

    return NextResponse.json({ 
      message: 'If an account exists, a reset link has been sent' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 })
  }
}