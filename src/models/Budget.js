import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly'],
    default: 'monthly'
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

budgetSchema.index({ email: 1, category: 1, period: 1 }, { unique: true })

budgetSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema)