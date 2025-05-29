const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Support both old and new recurring structure
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurring: {
      isRecurring: {
        type: Boolean,
        default: function () {
          return this.isRecurring || false
        },
      },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
        required: function () {
          return (this.recurring && this.recurring.isRecurring) || this.isRecurring
        },
      },
      nextDate: {
        type: Date,
        required: function () {
          return (this.recurring && this.recurring.isRecurring) || this.isRecurring
        },
      },
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save middleware to handle backward compatibility
transactionSchema.pre("save", function (next) {
  // If isRecurring is set but recurring.isRecurring is not, sync them
  if (this.isRecurring !== undefined && !this.recurring.isRecurring) {
    this.recurring.isRecurring = this.isRecurring
  }
  // If recurring.isRecurring is set but isRecurring is not, sync them
  if (this.recurring.isRecurring !== undefined && this.isRecurring === undefined) {
    this.isRecurring = this.recurring.isRecurring
  }
  next()
})

// Index for better query performance
transactionSchema.index({ userId: 1, date: -1 })
transactionSchema.index({ userId: 1, category: 1 })

module.exports = mongoose.model("Transaction", transactionSchema)
