import mongoose from 'mongoose'

const savingsGoalSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    default: 'Savings'
  },
  isCompleted: {
    type: Boolean,
    default: false
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

savingsGoalSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  if (this.currentAmount >= this.targetAmount) {
    this.isCompleted = true
  }
  next()
})

export default mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', savingsGoalSchema)