import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes
  }
}, {
  timestamps: true
})

export default mongoose.models.OTP || mongoose.model('OTP', otpSchema)