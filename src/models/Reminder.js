import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'monthly', 'yearly'],
    default: 'once'
  },
  reminderDays: {
    type: Number,
    default: 3,
    min: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastNotified: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

reminderSchema.index({ email: 1, dueDate: 1 })

export default mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema)