import mongoose from 'mongoose'

const recurringTransactionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['in', 'out'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  nextDue: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastProcessed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

recurringTransactionSchema.index({ email: 1, nextDue: 1 })

export default mongoose.models.RecurringTransaction || mongoose.model('RecurringTransaction', recurringTransactionSchema)