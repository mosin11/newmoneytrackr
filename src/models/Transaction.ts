import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['in', 'out']
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)