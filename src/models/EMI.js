import mongoose from 'mongoose'

const EMISchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  monthlyAmount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalMonths: {
    type: Number,
    required: true
  },
  remainingMonths: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    default: 0
  },
  processingFee: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Other']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  nextDueDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
EMISchema.index({ userEmail: 1, status: 1 })
EMISchema.index({ userEmail: 1, nextDueDate: 1 })

export default mongoose.models.EMI || mongoose.model('EMI', EMISchema)