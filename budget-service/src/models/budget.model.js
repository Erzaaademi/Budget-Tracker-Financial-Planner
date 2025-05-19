const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  notificationThreshold: {
    type: Number,
    default: 80 // percentage
  },
  currentSpending: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
